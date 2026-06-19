/**
 * Design DNA / concept variation layer (client-safe, pure — no imports).
 *
 * Each generation is steered toward one curated "design direction" so that
 * different variants feel like distinct interior concepts rather than minor
 * rerenders of the same safe premium room. The selected variation is injected
 * into the OpenAI image prompt and surfaced as a small premium concept label.
 *
 * Selection is DETERMINISTIC: a hash of (roomType, style, palette) picks the
 * starting preset, and the variant number walks forward from there — so React
 * rerenders never change the result, while "Show another option" (variant + 1)
 * always lands on a different preset.
 */

export interface DesignVariation {
  /** Stable id, e.g. "quiet-luxury". Never shown to the user. */
  variationId: string;
  titleRu: string;
  titleEn: string;
  mood: string;
  composition: string;
  furnitureStrategy: string;
  focalPoint: string;
  lightingStrategy: string;
  materials: string;
  decor: string;
  shapes: string;
}

/** 10 curated premium directions. English fields feed the prompt. */
export const DESIGN_VARIATIONS: DesignVariation[] = [
  {
    variationId: "quiet-luxury",
    titleRu: "Тихая роскошь",
    titleEn: "Quiet Luxury",
    mood: "calm, expensive, understated",
    composition: "balanced but not boring",
    furnitureStrategy: "low-profile sofa, refined coffee table, a soft lounge chair",
    focalPoint: "a serene seating group anchored by a quiet artwork",
    lightingStrategy: "warm layered lighting",
    materials: "walnut, stone, bouclé, linen",
    decor: "minimal art, books, ceramic objects",
    shapes: "soft rounded forms",
  },
  {
    variationId: "boutique-hotel",
    titleRu: "Бутик-отель",
    titleEn: "Boutique Hotel Suite",
    mood: "hotel-like, polished, elegant",
    composition: "symmetrical and composed",
    furnitureStrategy: "a statement sofa, side tables, accent chairs",
    focalPoint: "a symmetrical seating arrangement around a central table",
    lightingStrategy: "table lamps and wall sconces",
    materials: "marble, dark wood, warm metal, textured fabric",
    decor: "framed art, a sculptural vase",
    shapes: "a refined classic-modern balance",
  },
  {
    variationId: "gallery-apartment",
    titleRu: "Галерейная квартира",
    titleEn: "Gallery Apartment",
    mood: "artistic, curated, architectural",
    composition: "asymmetrical with a strong focal wall",
    furnitureStrategy: "a sculptural chair, a clean sofa, a minimal table",
    focalPoint: "a large artwork on a focal wall",
    lightingStrategy: "gallery-like accent lighting",
    materials: "plaster, oak, stone, black metal",
    decor: "a large artwork and a sculptural object",
    shapes: "geometric and architectural",
  },
  {
    variationId: "soft-family-living",
    titleRu: "Тёплая семейная гостиная",
    titleEn: "Soft Family Living",
    mood: "comfortable, warm, livable",
    composition: "practical circulation and cozy seating",
    furnitureStrategy: "a comfortable sofa, a rug, a coffee table, storage",
    focalPoint: "an inviting, relaxed seating zone",
    lightingStrategy: "warm ambient lighting",
    materials: "oak, linen, wool, warm neutral textiles",
    decor: "plants, books, cushions",
    shapes: "soft and friendly",
  },
  {
    variationId: "japandi-calm",
    titleRu: "Спокойствие Japandi",
    titleEn: "Japandi Calm",
    mood: "minimal, calm, natural",
    composition: "low furniture and open space",
    furnitureStrategy: "a low sofa, a simple coffee table, minimal storage",
    focalPoint: "an uncluttered, grounded centre",
    lightingStrategy: "soft diffused daylight",
    materials: "light wood, linen, clay, stone",
    decor: "a few curated natural objects",
    shapes: "simple, low, horizontal",
  },
  {
    variationId: "contemporary-statement",
    titleRu: "Современный акцент",
    titleEn: "Contemporary Statement",
    mood: "bold but premium",
    composition: "a strong single focal point",
    furnitureStrategy: "a statement lounge chair or a sculptural coffee table",
    focalPoint: "one bold sculptural furniture piece",
    lightingStrategy: "architectural lighting",
    materials: "stone, glass, metal, textured upholstery",
    decor: "a large art piece",
    shapes: "sculptural and modern",
  },
  {
    variationId: "warm-minimalism",
    titleRu: "Тёплый минимализм",
    titleEn: "Warm Minimalism",
    mood: "uncluttered but not cold",
    composition: "clean lines and generous negative space",
    furnitureStrategy: "a minimal sofa, a simple table, hidden storage",
    focalPoint: "a calm, quiet seating composition",
    lightingStrategy: "soft linear lighting",
    materials: "oak, travertine, cream textiles",
    decor: "very limited decor",
    shapes: "clean and calm",
  },
  {
    variationId: "dark-contemporary",
    titleRu: "Тёмный contemporary",
    titleEn: "Dark Contemporary",
    mood: "dramatic and premium, moody but still clearly visible",
    composition: "contrast-based",
    furnitureStrategy: "a deep sofa, dark wood, metal details",
    focalPoint: "a bold artwork against a darker backdrop",
    lightingStrategy: "layered warm lights that keep everything legible",
    materials: "dark wood, stone, leather and fabric",
    decor: "bold artwork",
    shapes: "strong and confident",
  },
  {
    variationId: "light-european",
    titleRu: "Светлая европейская",
    titleEn: "Light European Apartment",
    mood: "airy, bright, elegant",
    composition: "open and balanced",
    furnitureStrategy: "a light sofa, refined chairs, a slim coffee table",
    focalPoint: "a bright window-facing seating zone",
    lightingStrategy: "daylight-first with soft lamps",
    materials: "light oak, cream fabric, brushed metal",
    decor: "soft curtains, art, flowers",
    shapes: "elegant and light",
  },
  {
    variationId: "modern-organic",
    titleRu: "Модерн-органика",
    titleEn: "Modern Organic",
    mood: "natural, tactile, high-end",
    composition: "relaxed asymmetry",
    furnitureStrategy: "a curved sofa, an organic coffee table, a lounge chair",
    focalPoint: "a curved sofa as the organic centrepiece",
    lightingStrategy: "warm natural light",
    materials: "wood, stone, bouclé, clay, woven textures",
    decor: "plants, ceramics, soft textiles",
    shapes: "organic rounded forms",
  },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export interface VariationSelectInput {
  roomType: string;
  style: string;
  palette: string;
  mode: string;
  /** 0-based variant index; "Show another option" increments it. */
  variant: number;
}

/**
 * Deterministically pick a variation. The (roomType, style, palette) hash sets
 * the starting offset; the variant number walks forward so each variant is a
 * different preset, stable across rerenders.
 */
export function getDesignVariation(input: VariationSelectInput): DesignVariation {
  const base = hash(`${input.roomType}|${input.style}|${input.palette}`);
  const idx = (base + Math.max(0, input.variant)) % DESIGN_VARIATIONS.length;
  return DESIGN_VARIATIONS[idx];
}

/** English prompt block describing the selected design direction. */
export function variationPromptText(v: DesignVariation, isRedesign: boolean): string {
  const lead = `Concept variation / design direction — "${v.titleEn}":`;
  const body = [
    `Mood: ${v.mood}.`,
    `Composition: ${v.composition}.`,
    `Furniture strategy: ${v.furnitureStrategy}.`,
    `Focal point: ${v.focalPoint}.`,
    `Lighting strategy: ${v.lightingStrategy}.`,
    `Material emphasis: ${v.materials}.`,
    `Decor strategy: ${v.decor}.`,
    `Shape language: ${v.shapes}.`,
  ].join(" ");
  const distinct =
    "Keep the user's selected style and palette, but interpret them THROUGH this specific design direction, " +
    "and make the result visually distinct from other variants.";
  const redesignGuard = isRedesign
    ? "This direction may change furniture choice, composition, lighting mood, materials, decor and focal point — " +
      "but must NOT change the room shell, camera angle or architecture."
    : "";
  return [lead, body, distinct, redesignGuard].filter(Boolean).join(" ");
}
