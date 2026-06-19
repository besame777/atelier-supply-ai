export const locales = ["ru", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Safe coercion for route params (middleware guarantees valid locales in practice). */
export function toLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}
