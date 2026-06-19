/**
 * Post-generation design analysis (server-only).
 *
 * After an image is generated, this runs a second OpenAI vision pass over the
 * GENERATED image to extract what is actually visible — furniture, lighting,
 * decor and materials with accurate counts — so the report reflects the real
 * result instead of a generic template. In redesign mode it also compares the
 * original photo against the generated concept ("what was added / changed").
 *
 * Never imported by client code. The API key is read from the server
 * environment only. On any failure it falls back to a deterministic demo
 * analysis so the report still renders.
 */
import OpenAI from "openai";
import type {
  AnalysisItem,
  AnalysisMaterial,
  DesignAnalysis,
} from "@/lib/types";
import type { ProviderGenerationInput, UploadedImage } from "@/lib/ai/providers";

/** Vision model — override with OPENAI_VISION_MODEL. gpt-4o-mini supports images. */
const DEFAULT_VISION_MODEL = "gpt-4o-mini";

function visionModel(): string {
  return process.env.OPENAI_VISION_MODEL || DEFAULT_VISION_MODEL;
}

let cached: OpenAI | null = null;
function client(): OpenAI {
  if (!cached) cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return cached;
}

function uploadedToDataUrl(img: UploadedImage): string {
  return `data:${img.mimeType};base64,${img.data.toString("base64")}`;
}

/* --------------------------- prompt construction -------------------------- */

const SCHEMA_HINT = `Return ONLY valid JSON with this exact shape:
{
  "furniture": [{ "name_ru": "string", "name_en": "string", "count": number }],
  "lighting":  [{ "name_ru": "string", "name_en": "string", "count": number }],
  "decor":     [{ "name_ru": "string", "name_en": "string", "count": number }],
  "materials": [{ "ru": "string", "en": "string" }],
  "layoutSummaryRu": "string",
  "layoutSummaryEn": "string",
  "notesRu": ["string"],
  "notesEn": ["string"],
  "addedRu": ["string"],
  "addedEn": ["string"],
  "changedRu": ["string"],
  "changedEn": ["string"]
}`;

const RULES = [
  "Describe ONLY what is clearly visible (or strongly inferable) in the GENERATED design image.",
  "Do NOT invent or hallucinate items that are not actually present.",
  "If you are unsure about an item, omit it rather than guessing.",
  "Counts must be as accurate as possible: if there is 1 sofa, count 1; if there are 5 chairs, count 5.",
  "A partially visible but reasonably certain item may still be counted.",
  "Provide both Russian (name_ru) and English (name_en) names for every item.",
  "name_ru MUST be a short noun in NOMINATIVE SINGULAR (именительный падеж, единственное число): " +
    "'Картина' not 'Картину', 'Лампа' not 'Лампу', 'Кресло' not 'Кресла', 'Стул' not 'Стулья'.",
  "name_en MUST be a short SINGULAR noun: 'Painting' not 'A painting', 'Armchair' not 'Armchairs'.",
  "Never use accusative/genitive/plural grammatical forms in name_ru or name_en.",
  "Store quantity ONLY in the count field — never embed numbers or plural forms in the name.",
  "Do not include adjectives unless an adjective is necessary to identify the object " +
    "(e.g. 'Настольная лампа' is fine; avoid decorative phrasing like 'Декоративных подушек' or 'Столик у окна').",
  "Use PROFESSIONAL interior / furniture-specification names. Avoid overly generic words like " +
    "'Стол', 'Лампа', 'Подставка' / 'Table', 'Lamp', 'Stand' when a more specific visible category can be inferred.",
  "Tables: a low table in front of a sofa = 'Журнальный столик' / 'Coffee table'; a small table beside a sofa/chair = " +
    "'Приставной столик' / 'Side table'; a narrow decorative table = 'Консоль' / 'Console table'; " +
    "a unit under or near a TV = 'ТВ-тумба' / 'TV console'; general storage = 'Тумба' / 'Cabinet'.",
  "Lighting: name the specific fixture — 'Настольная лампа' / 'Table lamp' (on a surface), " +
    "'Торшер' / 'Floor lamp' (standing on the floor), 'Бра' / 'Wall sconce' (wall-mounted), " +
    "'Подвесной светильник' / 'Pendant light' (hanging). Avoid the bare word 'Лампа' / 'Lamp'.",
  "Use 'Ковёр' / 'Rug' for interior floor rugs (not 'Коврик' / 'Mat'). " +
    "Use 'Комнатное растение' / 'Indoor plant' for decorative plants.",
  "Do NOT over-specify when uncertain: if you cannot tell which specific category an object is, choose the safest " +
    "professional category; if still unsure, omit it. Avoid the vague word 'Подставка' / 'Stand'.",
  "materials = the dominant visible materials/finishes (wood, marble, brass, linen, etc.).",
  "layoutSummary = one concise sentence describing the visible layout, in RU and EN.",
  "notes = short confidence notes or assumptions only if something is unclear (else empty arrays).",
];

/** Few-shot examples to lock the expected item shape. */
const NAME_EXAMPLES = `Good items:
{ "name_ru": "Картина", "name_en": "Painting", "count": 1 }
{ "name_ru": "Диван", "name_en": "Sofa", "count": 1 }
{ "name_ru": "Кресло", "name_en": "Armchair", "count": 2 }
Bad items (wrong grammatical case / plural / article — never produce these):
{ "name_ru": "Картину", "name_en": "A painting", "count": 1 }
{ "name_ru": "Кресла", "name_en": "Armchairs", "count": 2 }

Prefer the specific professional name over the generic one:
- "Журнальный столик" / "Coffee table"  (NOT "Стол" / "Table")  — low table in front of a sofa
- "ТВ-тумба" / "TV console"  (NOT "Подставка" / "Stand")  — unit under/near a TV
- "Консоль" / "Console table"  (NOT "Подставка")  — narrow decorative table
- "Приставной столик" / "Side table"  (NOT "Подставка")  — next to a sofa/chair
- "Настольная лампа" / "Table lamp"  (NOT "Лампа" / "Lamp")  — sits on a table
- "Торшер" / "Floor lamp"  (NOT "Лампа")  — stands on the floor
- "Бра" / "Wall sconce"  (NOT "Лампа")  — mounted on the wall
- "Ковёр" / "Rug"  (NOT "Коврик" / "Mat")  — living-room rug
- "Комнатное растение" / "Indoor plant"  (NOT "Растение" / "Plant")  — decorative plant`;

function instructions(mode: ProviderGenerationInput["mode"]): string {
  const base = [...RULES];
  if (mode === "room_photo_redesign") {
    base.push(
      "Two images are provided: the FIRST is the ORIGINAL room photo, the SECOND is the GENERATED redesign concept.",
      "Analyse the SECOND (generated) image for all visible-items fields.",
      "addedRu/addedEn = what the concept ADDS vs. the original. Write each as a short premium design phrase " +
        "explaining the element and its role — NOT a bare noun. Bad: 'Кресло', 'Тумба', 'Лампа'. " +
        "Good: 'Диванная зона с журнальным столиком', 'Настольная лампа для мягкого вечернего света', " +
        "'Комнатные растения как декоративные акценты'.",
      "changedRu/changedEn = how the SPACE changed in design terms (palette, atmosphere, zoning, lighting layers, " +
        "textures, forms) — NOT raw 'added X' statements. Bad: 'Появился диван', 'Изменилась палитра'. " +
        "Good: 'Комната получила более тёплую светлую палитру', 'Центральная зона стала оформленной зоной отдыха', " +
        "'Освещение стало более уютным и многослойным'.",
      "Base added/changed ONLY on what is actually visible in the comparison; never invent objects. " +
        "If unsure of exact objects, use broader safe design language (e.g. 'Добавлены декоративные акценты в зоне отдыха').",
      "Each of addedRu, addedEn, changedRu, changedEn must have 3–5 concise bullets (a short phrase, not one word).",
      "Keep the tone premium and client-friendly. Never use technical words like 'object detection', 'AI inferred', " +
        "'model thinks' or 'visual delta'."
    );
  } else {
    base.push(
      "One image is provided: the GENERATED interior concept. Analyse it.",
      "Leave addedRu, addedEn, changedRu, changedEn as empty arrays (no original to compare)."
    );
  }
  return base.map((r, i) => `${i + 1}. ${r}`).join("\n");
}

/* ------------------------------ normalization ----------------------------- */

function toInt(v: unknown, fallback = 1): number {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Safety fallback for common Russian case/number mistakes the model occasionally
 * returns — map them back to nominative singular. Whole-name, case-insensitive.
 */
const RU_NOMINATIVE_FIXES: Record<string, string> = {
  "картину": "Картина",
  "лампу": "Лампа",
  "вазу": "Ваза",
  "подушки": "Подушка",
  "кресла": "Кресло",
  "стулья": "Стул",
  "цветы": "Цветок",
  "растения": "Растение",
};

function fixRuName(name: string): string {
  return RU_NOMINATIVE_FIXES[name.toLowerCase()] ?? name;
}

type ItemCategory = "furniture" | "lighting" | "decor";

function isLivingRoom(roomKey: string): boolean {
  const k = roomKey.toLowerCase();
  return k === "living" || k.includes("living") || k.includes("гостин");
}

/**
 * Professional naming fallback (safety net for the prompt). Upgrades a few
 * generic terms to interior/procurement vocabulary. Conservative: only renames
 * unambiguous generic words, and the living-room table rule is room-aware.
 * "Подставка"/"Лампа" are intentionally left alone (handled by the prompt) to
 * avoid wrong guesses.
 */
function refineNames(
  ru: string,
  en: string,
  category: ItemCategory,
  roomKey: string
): { ru: string; en: string } {
  const lru = ru.toLowerCase();
  const len = en.toLowerCase();

  // Interior rug, not a doormat.
  if (lru === "коврик") ru = "Ковёр";
  if (len === "mat") en = "Rug";

  // Decorative indoor plant.
  if (lru === "растение") ru = "Комнатное растение";
  if (len === "plant") en = "Indoor plant";

  // A bare "table" in a living room is almost always the coffee table.
  if (category === "furniture" && isLivingRoom(roomKey)) {
    if (lru === "стол") ru = "Журнальный столик";
    if (len === "table") en = "Coffee table";
  }

  return { ru, en };
}

function normItems(
  v: unknown,
  category: ItemCategory,
  roomKey: string,
  max = 14
): AnalysisItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      const { ru, en } = refineNames(
        fixRuName(str(o.name_ru)),
        str(o.name_en),
        category,
        roomKey
      );
      return { name_ru: ru, name_en: en, count: toInt(o.count) };
    })
    .filter((it) => it.name_ru || it.name_en)
    .slice(0, max);
}

function normMaterials(v: unknown, max = 10): AnalysisMaterial[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((it) => {
      // Accept either { ru, en } or a plain string.
      if (typeof it === "string") return { ru: it.trim(), en: it.trim() };
      const o = (it ?? {}) as Record<string, unknown>;
      return { ru: str(o.ru) || str(o.name_ru), en: str(o.en) || str(o.name_en) };
    })
    .filter((m) => m.ru || m.en)
    .slice(0, max);
}

function normStrings(v: unknown, max = 8): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(str).filter(Boolean).slice(0, max);
}

/**
 * Cleanup for added/changed bullets: trim, drop empties, dedupe (case-insensitive),
 * prefer descriptive multi-word phrases over bare one-word nouns (dropped only when
 * richer bullets remain), and cap at `max`.
 */
function normBullets(v: unknown, max = 5): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const cleaned = v
    .map(str)
    .filter(Boolean)
    .filter((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  const multiWord = cleaned.filter((s) => s.includes(" "));
  return (multiWord.length > 0 ? multiWord : cleaned).slice(0, max);
}

function normalize(raw: Record<string, unknown>, roomKey: string): DesignAnalysis {
  return {
    furniture: normItems(raw.furniture, "furniture", roomKey),
    lighting: normItems(raw.lighting, "lighting", roomKey),
    decor: normItems(raw.decor, "decor", roomKey),
    materials: normMaterials(raw.materials),
    layoutSummaryRu: str(raw.layoutSummaryRu),
    layoutSummaryEn: str(raw.layoutSummaryEn),
    notesRu: normStrings(raw.notesRu),
    notesEn: normStrings(raw.notesEn),
    addedRu: normBullets(raw.addedRu),
    addedEn: normBullets(raw.addedEn),
    changedRu: normBullets(raw.changedRu),
    changedEn: normBullets(raw.changedEn),
    isMock: false,
  };
}

/* -------------------------------- analysis -------------------------------- */

export interface AnalyzeArgs {
  /** Data URL (or remote URL) of the generated image. */
  generatedImage: string;
  /** Uploaded original photo — redesign mode only. */
  originalImage?: UploadedImage;
  input: ProviderGenerationInput;
}

/** Run the vision analysis over the generated image. Throws on API failure. */
export async function analyzeGeneratedDesign(args: AnalyzeArgs): Promise<DesignAnalysis> {
  const { generatedImage, originalImage, input } = args;

  const context =
    `Context (for reference only — verify against the image, do not trust blindly): ` +
    `room type "${input.labels.roomType || input.roomType}", ` +
    `style "${input.labels.style || input.style}", ` +
    `palette "${input.labels.palette || input.palette}".`;

  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: `${instructions(input.mode)}\n\n${NAME_EXAMPLES}\n\n${context}\n\n${SCHEMA_HINT}` },
  ];

  if (input.mode === "room_photo_redesign" && originalImage) {
    content.push(
      { type: "text", text: "ORIGINAL room photo:" },
      { type: "image_url", image_url: { url: uploadedToDataUrl(originalImage) } },
      { type: "text", text: "GENERATED redesign concept:" }
    );
  }
  content.push({ type: "image_url", image_url: { url: generatedImage } });

  const res = await client().chat.completions.create({
    model: visionModel(),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a senior interior designer auditing an AI-generated interior visualization. " +
          "You report only what is visible, with accurate counts, and you never invent items. " +
          "You always answer with strict JSON.",
      },
      { role: "user", content },
    ],
  });

  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("Vision analysis returned empty content");
  const parsed = JSON.parse(text) as Record<string, unknown>;
  return normalize(parsed, input.roomType);
}

/* ----------------------------- mock fallback ------------------------------ */

type MockItem = { ru: string; en: string; count: number };

const MOCK_FURNITURE: Record<string, MockItem[]> = {
  living: [
    { ru: "Диван", en: "Sofa", count: 1 },
    { ru: "Кресло", en: "Armchair", count: 2 },
    { ru: "Журнальный столик", en: "Coffee table", count: 1 },
    { ru: "Ковёр", en: "Rug", count: 1 },
  ],
  bedroom: [
    { ru: "Кровать", en: "Bed", count: 1 },
    { ru: "Прикроватная тумба", en: "Nightstand", count: 2 },
    { ru: "Шкаф", en: "Wardrobe", count: 1 },
  ],
  kitchen: [
    { ru: "Кухонный гарнитур", en: "Kitchen cabinetry", count: 1 },
    { ru: "Обеденный стол", en: "Dining table", count: 1 },
    { ru: "Стул", en: "Dining chair", count: 4 },
  ],
  office: [
    { ru: "Рабочий стол", en: "Desk", count: 1 },
    { ru: "Рабочее кресло", en: "Office chair", count: 1 },
    { ru: "Стеллаж", en: "Shelving unit", count: 1 },
  ],
  kids: [
    { ru: "Кровать", en: "Bed", count: 1 },
    { ru: "Письменный стол", en: "Desk", count: 1 },
    { ru: "Система хранения", en: "Storage unit", count: 1 },
  ],
  bathroom: [
    { ru: "Тумба с раковиной", en: "Vanity unit", count: 1 },
    { ru: "Зеркало", en: "Mirror", count: 1 },
  ],
};

const MOCK_LIGHTING: MockItem[] = [
  { ru: "Подвесной светильник", en: "Pendant light", count: 1 },
  { ru: "Торшер", en: "Floor lamp", count: 1 },
];

const MOCK_DECOR: MockItem[] = [
  { ru: "Шторы", en: "Curtains", count: 1 },
  { ru: "Декоративные подушки", en: "Cushions", count: 3 },
  { ru: "Растение в кашпо", en: "Potted plant", count: 1 },
];

const MOCK_MATERIALS: AnalysisMaterial[] = [
  { ru: "Дерево", en: "Wood" },
  { ru: "Текстиль", en: "Textile" },
  { ru: "Металл", en: "Metal" },
];

const asItems = (xs: MockItem[]): AnalysisItem[] =>
  xs.map((x) => ({ name_ru: x.ru, name_en: x.en, count: x.count }));

/**
 * Deterministic demo analysis used when vision is unavailable (mock image,
 * no API key, or a failed vision call). Clearly representative, not claimed
 * to be derived from the actual pixels — paired with the demo-mode UI state.
 */
export function mockDesignAnalysis(input: ProviderGenerationInput): DesignAnalysis {
  const furniture = MOCK_FURNITURE[input.roomType] ?? MOCK_FURNITURE.living;
  return {
    furniture: asItems(furniture),
    lighting: asItems(MOCK_LIGHTING),
    decor: asItems(MOCK_DECOR),
    materials: MOCK_MATERIALS,
    layoutSummaryRu:
      "Демонстрационная раскладка: основная зона у источника света, проходы свободны.",
    layoutSummaryEn:
      "Demo layout: the main zone sits by the light source with clear circulation.",
    notesRu: ["Демонстрационный разбор — реальный анализ доступен при включённой генерации OpenAI."],
    notesEn: ["Demo breakdown — a real analysis is available when OpenAI generation is enabled."],
    addedRu: [],
    addedEn: [],
    changedRu: [],
    changedEn: [],
    isMock: true,
  };
}
