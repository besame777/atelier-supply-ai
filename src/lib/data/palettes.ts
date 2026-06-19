import type { Locale } from "@/i18n/config";

/**
 * Curated color palettes for the AI room concept.
 *
 * Swatch HEX values live here (not localized); each swatch's tone name is
 * localized inline, matching the pattern used for style palettes in
 * `reports.ts`. The palette's display name + description (for the selector UI)
 * live in the RU/EN dictionaries under `ai.roomForm.palettes`.
 */
type L = Record<Locale, string>;

export interface PaletteSwatch {
  name: L;
  hex: string;
}

/** Ordered palette keys — the selector and validation iterate this. */
export const PALETTE_KEYS = [
  "warm-neutral",
  "light-greige",
  "walnut-cream",
  "graphite-beige",
  "olive-sand",
  "mocha-stone",
  "light-european",
  "dark-contemporary",
] as const;

export const PALETTES: Record<string, PaletteSwatch[]> = {
  "warm-neutral": [
    { name: { ru: "Тёплый белый", en: "Warm white" }, hex: "#efe7da" },
    { name: { ru: "Песочный", en: "Sand" }, hex: "#d8c8b8" },
    { name: { ru: "Греж", en: "Greige" }, hex: "#b9a589" },
    { name: { ru: "Орех", en: "Walnut" }, hex: "#6f5b45" },
  ],
  "light-greige": [
    { name: { ru: "Слоновая кость", en: "Ivory" }, hex: "#f2ece3" },
    { name: { ru: "Светлый греж", en: "Light greige" }, hex: "#ddd2c2" },
    { name: { ru: "Тёплый серый", en: "Warm grey" }, hex: "#c0b09a" },
    { name: { ru: "Какао", en: "Cocoa" }, hex: "#8c7d68" },
  ],
  "walnut-cream": [
    { name: { ru: "Кремовый", en: "Cream" }, hex: "#f3ebdd" },
    { name: { ru: "Светлый дуб", en: "Light oak" }, hex: "#d8c4a6" },
    { name: { ru: "Орех", en: "Walnut" }, hex: "#a9774a" },
    { name: { ru: "Тёмный орех", en: "Dark walnut" }, hex: "#5a3b25" },
  ],
  "graphite-beige": [
    { name: { ru: "Бежевый", en: "Beige" }, hex: "#ece4d8" },
    { name: { ru: "Песочный", en: "Sand" }, hex: "#c9b8a6" },
    { name: { ru: "Тёплый графит", en: "Warm graphite" }, hex: "#6f6a64" },
    { name: { ru: "Графит", en: "Graphite" }, hex: "#2f2c29" },
  ],
  "olive-sand": [
    { name: { ru: "Тёплый белый", en: "Warm white" }, hex: "#efe9da" },
    { name: { ru: "Песочный", en: "Sand" }, hex: "#d6c8a6" },
    { name: { ru: "Олива", en: "Olive" }, hex: "#9aa07a" },
    { name: { ru: "Тёмная олива", en: "Dark olive" }, hex: "#6b6a4b" },
  ],
  "mocha-stone": [
    { name: { ru: "Камень светлый", en: "Light stone" }, hex: "#ece5db" },
    { name: { ru: "Камень", en: "Stone" }, hex: "#c9bcae" },
    { name: { ru: "Мокко", en: "Mocha" }, hex: "#8d6f5a" },
    { name: { ru: "Тёмное какао", en: "Dark cocoa" }, hex: "#4a3a30" },
  ],
  "light-european": [
    { name: { ru: "Слоновая кость", en: "Ivory" }, hex: "#f5efe6" },
    { name: { ru: "Песочный", en: "Sand" }, hex: "#e0d3bf" },
    { name: { ru: "Мягкий таупе", en: "Soft taupe" }, hex: "#c2b39a" },
    { name: { ru: "Приглушённая олива", en: "Muted olive" }, hex: "#8d8a6f" },
  ],
  "dark-contemporary": [
    { name: { ru: "Тёплый песок", en: "Warm sand" }, hex: "#d9cdbb" },
    { name: { ru: "Таупе", en: "Taupe" }, hex: "#9b8a76" },
    { name: { ru: "Эспрессо", en: "Espresso" }, hex: "#42342a" },
    { name: { ru: "Графит", en: "Charcoal" }, hex: "#23201d" },
  ],
};

/** Localized swatches for a palette key, falling back to the warm neutral set. */
export function paletteSwatches(
  key: string,
  locale: Locale
): { name: string; hex: string }[] {
  const swatches = PALETTES[key] ?? PALETTES["warm-neutral"];
  return swatches.map((s) => ({ name: s.name[locale], hex: s.hex }));
}
