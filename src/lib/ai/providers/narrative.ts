/**
 * Localized concept narrative (summary + assumptions) shared by all providers.
 * The wording is provider-agnostic and always frames output as a PRELIMINARY
 * VISUALIZATION reviewed by an Atelier Supply manager.
 */
import type { Locale } from "@/i18n/config";
import type { ProviderGenerationInput } from "./types";

/** Per-variant emphasis line — keeps regenerations conceptually distinct. */
const EMPHASIS: Record<Locale, string[]> = {
  ru: [
    "Акцент на главной зоне у окна и композиции центра комнаты",
    "Акцент на системах хранения и функциональности",
    "Акцент на мягких зонах, текстиле и уюте",
    "Акцент на освещении, декоре и финальных деталях",
  ],
  en: [
    "Emphasis on the main zone by the window and the room's centre",
    "Emphasis on storage systems and functionality",
    "Emphasis on soft seating, textiles and comfort",
    "Emphasis on lighting, decor and finishing details",
  ],
};

export function buildConceptSummary(input: ProviderGenerationInput): string {
  const { mode, variant, locale, labels } = input;
  const n = variant + 1;
  if (locale === "ru") {
    return mode === "room_photo_redesign"
      ? `Редизайн вашей комнаты (${labels.roomType}) в стиле «${labels.style}», палитра «${labels.palette}». Предварительная визуализация, вариант ${n}.`
      : `AI-концепция комнаты (${labels.roomType}) в стиле «${labels.style}», палитра «${labels.palette}», создана по параметрам. Предварительная визуализация, вариант ${n}.`;
  }
  return mode === "room_photo_redesign"
    ? `A redesign of your room (${labels.roomType}) in the ${labels.style} style with the ${labels.palette} palette. Preliminary visualization, option ${n}.`
    : `An AI concept (${labels.roomType}) in the ${labels.style} style with the ${labels.palette} palette, generated from your parameters. Preliminary visualization, option ${n}.`;
}

export function buildConceptAssumptions(input: ProviderGenerationInput): string[] {
  const { mode, variant, locale } = input;
  const emphasis = EMPHASIS[locale][variant % EMPHASIS[locale].length];
  if (locale === "ru") {
    return [
      emphasis,
      mode === "room_photo_redesign"
        ? "Сохранены геометрия комнаты, окна и двери с исходного фото"
        : "Планировка адаптирована под указанные размеры комнаты",
      mode === "room_photo_redesign"
        ? "Мебель, свет и отделка подобраны в рамках выбранного стиля и палитры"
        : "Мебель и свет подобраны в рамках выбранного стиля и палитры",
      "Визуализация отражает предварительную идею, финальные решения уточняет менеджер Atelier Supply",
    ];
  }
  return [
    emphasis,
    mode === "room_photo_redesign"
      ? "The room's geometry, windows and doors from your photo are preserved"
      : "The layout is adapted to the room dimensions provided",
    mode === "room_photo_redesign"
      ? "Furniture, lighting and finishes follow the selected style and palette"
      : "Furniture and lighting follow the selected style and palette",
    "This visualization is a preliminary idea; final decisions are reviewed by an Atelier Supply manager",
  ];
}
