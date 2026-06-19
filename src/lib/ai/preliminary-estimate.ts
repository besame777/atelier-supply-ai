/**
 * Item-based preliminary estimate (client-safe, pure — no server imports).
 *
 * Turns the vision `DesignAnalysis` (detected furniture / lighting / decor with
 * counts) into a broad preliminary price range for China sourcing / interior
 * procurement. Ranges are intentionally wide and indicative — NOT a final quote.
 * Unknown items fall back to a conservative per-category range so it never fails.
 */
import type { AnalysisItem, DesignAnalysis } from "@/lib/types";

export type EstimateGroupKey = "furniture" | "lighting" | "decor";

export interface EstimateLineItem {
  name_ru: string;
  name_en: string;
  count: number;
  low: number;
  high: number;
  note_ru: string;
  note_en: string;
}

export interface EstimateGroup {
  key: EstimateGroupKey;
  items: EstimateLineItem[];
  low: number;
  high: number;
}

export interface PreliminaryEstimate {
  estimateLow: number;
  estimateHigh: number;
  currency: string;
  groups: EstimateGroup[];
}

/** Per-unit USD ranges keyed by lowercased RU/EN names. */
type PriceEntry = { keys: string[]; low: number; high: number };

const PRICE_TABLE: PriceEntry[] = [
  // Furniture
  { keys: ["диван", "sofa"], low: 1200, high: 3500 },
  { keys: ["кресло", "armchair"], low: 350, high: 1200 },
  { keys: ["журнальный столик", "coffee table"], low: 180, high: 800 },
  { keys: ["тв-тумба", "тв тумба", "tv console", "tv unit", "tv stand"], low: 300, high: 1200 },
  { keys: ["консоль", "console table", "console"], low: 250, high: 1000 },
  { keys: ["приставной столик", "side table"], low: 120, high: 500 },
  { keys: ["тумба", "cabinet", "sideboard"], low: 250, high: 900 },
  { keys: ["стул", "chair"], low: 120, high: 450 },
  // Lighting
  { keys: ["настольная лампа", "table lamp"], low: 60, high: 300 },
  { keys: ["торшер", "floor lamp"], low: 120, high: 600 },
  { keys: ["бра", "wall sconce", "sconce"], low: 80, high: 350 },
  { keys: ["подвесной светильник", "pendant light", "pendant"], low: 180, high: 900 },
  { keys: ["люстра", "chandelier"], low: 400, high: 2500 },
  // Decor
  { keys: ["ковёр", "ковер", "rug"], low: 250, high: 1200 },
  { keys: ["картина", "painting", "artwork", "wall art"], low: 80, high: 500 },
  { keys: ["зеркало", "mirror"], low: 120, high: 700 },
  { keys: ["ваза", "vase"], low: 40, high: 250 },
  { keys: ["комнатное растение", "indoor plant", "растение", "plant"], low: 40, high: 180 },
  { keys: ["подушка", "pillow", "cushion"], low: 25, high: 120 },
  { keys: ["книга", "book"], low: 10, high: 60 },
];

/** Conservative fallback per-unit range when an item is not in the table. */
const CATEGORY_FALLBACK: Record<EstimateGroupKey, [number, number]> = {
  furniture: [200, 900],
  lighting: [80, 400],
  decor: [40, 300],
};

/** Premium styles cost a bit more; keys match reports.ts / the style selector. */
const STYLE_MULTIPLIER: Record<string, number> = {
  classic: 1.25,
  luxury: 1.25,
  boutique: 1.25,
  loft: 1.05,
  minimalist: 1.0,
  modern: 1.0,
  japandi: 1.0,
  "light-european": 1.0,
};

function maxKeyLen(e: PriceEntry): number {
  return e.keys.reduce((m, k) => Math.max(m, k.length), 0);
}

/** Resolve a per-unit [low, high] for an item, by name, then category fallback. */
function unitRange(item: AnalysisItem, category: EstimateGroupKey): [number, number] {
  const cands = [item.name_en, item.name_ru]
    .map((s) => (s || "").trim().toLowerCase())
    .filter(Boolean);

  // Exact name match first.
  for (const e of PRICE_TABLE) {
    if (e.keys.some((k) => cands.includes(k))) return [e.low, e.high];
  }
  // Substring match, most specific (longest key) first — so "тв-тумба" beats "тумба".
  const sorted = [...PRICE_TABLE].sort((a, b) => maxKeyLen(b) - maxKeyLen(a));
  for (const e of sorted) {
    if (e.keys.some((k) => cands.some((c) => c.includes(k)))) return [e.low, e.high];
  }
  return CATEGORY_FALLBACK[category];
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export interface BuildEstimateArgs {
  roomType: string;
  style: string;
  palette: string;
  /** Budget bracket key from the form, if available (reserved for future tuning). */
  budget?: string;
  analysis: DesignAnalysis;
}

/**
 * Build an item-based preliminary estimate from the design analysis.
 * Returns groups with zero items removed; an all-empty analysis yields no groups
 * (callers should treat that as "no estimate" and fall back to the generic one).
 */
export function buildPreliminaryEstimate(args: BuildEstimateArgs): PreliminaryEstimate {
  const mult = STYLE_MULTIPLIER[args.style] ?? 1.0;

  const sources: { key: EstimateGroupKey; items: AnalysisItem[] }[] = [
    { key: "furniture", items: args.analysis.furniture },
    { key: "lighting", items: args.analysis.lighting },
    { key: "decor", items: args.analysis.decor },
  ];

  const groups: EstimateGroup[] = [];

  for (const src of sources) {
    if (!src.items.length) continue;
    const items: EstimateLineItem[] = src.items.map((it) => {
      const count = Math.max(1, Math.trunc(it.count) || 1);
      const [ul, uh] = unitRange(it, src.key);
      const low = roundTo(ul * mult * count, 10);
      const high = roundTo(uh * mult * count, 10);
      return {
        name_ru: it.name_ru,
        name_en: it.name_en,
        count,
        low,
        high,
        note_ru: count > 1 ? `${count} шт., ориентировочный диапазон` : "ориентировочный диапазон",
        note_en: count > 1 ? `${count} pcs, indicative range` : "indicative range",
      };
    });
    const low = items.reduce((s, i) => s + i.low, 0);
    const high = items.reduce((s, i) => s + i.high, 0);
    groups.push({ key: src.key, items, low, high });
  }

  return {
    estimateLow: groups.reduce((s, g) => s + g.low, 0),
    estimateHigh: groups.reduce((s, g) => s + g.high, 0),
    currency: "USD",
    groups,
  };
}

/** Format a USD amount, e.g. 1200 → "$1,200". */
export function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** Format a USD range, e.g. "$1,200–$3,500". */
export function formatUsdRange(low: number, high: number): string {
  return `${formatUsd(low)}–${formatUsd(high)}`;
}
