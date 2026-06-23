import { withBasePath } from "@/lib/base-path";
import type { SiteImage } from "@/lib/types";

/**
 * Central image registry. All images are local Atelier Supply assets served
 * from `public/images`. To swap photography later, replace the file in
 * `public/images` or repoint `src` here — components never reference paths
 * directly.
 */
export const siteImages = {
  hero: {
    src: withBasePath("/images/hero-main.webp"),
    alt: {
      ru: "Светлая гостиная премиум-класса в тёплых бежевых тонах",
      en: "Bright premium living room in warm beige tones",
    },
  },
  about: {
    src: withBasePath("/images/about-image.webp"),
    alt: {
      ru: "Тёплый современный интерьер с естественным светом",
      en: "Warm modern interior with natural light",
    },
  },
  services: {
    src: withBasePath("/images/services-image.webp"),
    alt: {
      ru: "Кураторская подборка мебели, света и материалов",
      en: "Curated selection of furniture, lighting and materials",
    },
  },
  process: {
    src: withBasePath("/images/project-luxury-villa.webp"),
    alt: {
      ru: "Интерьер премиальной виллы в спокойных тонах",
      en: "Premium villa interior in calm tones",
    },
  },
  aiProject: {
    src: withBasePath("/images/services-image.webp"),
    alt: {
      ru: "Комплектация интерьера по дизайн-проекту",
      en: "Interior procurement built to a design project",
    },
  },
  aiRoom: {
    src: withBasePath("/images/hero-main.webp"),
    alt: {
      ru: "Светлая комната, готовая к меблировке",
      en: "Bright room ready to be furnished",
    },
  },
} satisfies Record<string, SiteImage>;
