import type { Locale } from "@/i18n/config";

/** A string available in both locales. */
export type LocalizedString = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

/** Visual tone used for image-free placeholder blocks. */
export type Tone = "beige" | "sand" | "brown" | "charcoal";

/**
 * Site imagery. Local Atelier Supply assets under `public/images` —
 * swap the file or repoint `src` without touching components.
 */
export interface SiteImage {
  src: string;
  alt: LocalizedString;
}

export interface Project {
  slug: string;
  tone: Tone;
  image: SiteImage;
  title: LocalizedString;
  location: LocalizedString;
  /** Area in m². */
  area: number;
  budget: string;
  duration: LocalizedString;
  summary: LocalizedString;
  description: LocalizedList;
  scope: LocalizedList;
  tags: LocalizedList;
}

export type QualityTier = "economy" | "balanced" | "premium";

export interface ProjectEstimateInput {
  objectType: string;
  area: number;
  city: string;
  budget: string;
  quality: QualityTier;
  deadline: string;
  comment: string;
}

export interface RoomConceptInput {
  roomType: string;
  length: number;
  width: number;
  height: number;
  windows: number;
  doors: number;
  constraints: string;
  style: string;
  /** Selected color palette key (see src/lib/data/palettes.ts). */
  palette: string;
  budget: string;
  city: string;
}

/* --------------------------- Design generation --------------------------- */

/**
 * How the room visual is produced:
 * - `redesign`: an empty-room photo was uploaded → redesign THAT room.
 * - `from-parameters`: no photo → generate a new concept from inputs.
 */
export type GenerationMode = "redesign" | "from-parameters";

export type GenerationStatus = "idle" | "generating" | "ready" | "error";

/** Structured input for the (future real) image generation. */
export interface DesignGenerationInput {
  mode: GenerationMode;
  hasPhoto: boolean;
  roomType: string;
  style: string;
  palette: string;
  area: number;
  budget: string;
  constraints: string;
  /** 0-based regeneration attempt; 0 = the first generated variant. */
  variant: number;
}

/** A visible item with a bilingual name and an observed count. */
export interface AnalysisItem {
  name_ru: string;
  name_en: string;
  count: number;
}

/** A dominant material/finish, localized. */
export interface AnalysisMaterial {
  ru: string;
  en: string;
}

/**
 * Structured description of what is actually visible in the generated design.
 * Produced server-side by a vision pass over the generated image (and, in
 * redesign mode, compared against the original photo). Falls back to a
 * deterministic demo analysis when vision is unavailable (`isMock`).
 */
export interface DesignAnalysis {
  furniture: AnalysisItem[];
  lighting: AnalysisItem[];
  decor: AnalysisItem[];
  materials: AnalysisMaterial[];
  layoutSummaryRu: string;
  layoutSummaryEn: string;
  notesRu: string[];
  notesEn: string[];
  /** Redesign comparison — what the concept adds vs. the original photo. */
  addedRu?: string[];
  addedEn?: string[];
  /** Redesign comparison — what visibly changed vs. the original photo. */
  changedRu?: string[];
  changedEn?: string[];
  /** True when this is a deterministic demo analysis, not vision-derived. */
  isMock?: boolean;
}

/**
 * Generation result. Today the preview image is a curated local placeholder
 * chosen deterministically from the inputs; once a real provider is wired in,
 * only the service layer changes — this shape (and the UI) stay the same.
 */
export interface DesignGenerationResult {
  mode: GenerationMode;
  status: GenerationStatus;
  /** 0-based variant index for this result. */
  variant: number;
  /** Generated (placeholder) preview image URL. */
  previewImage: string;
  /** Original uploaded photo URL — redesign mode only. */
  originalImage?: string;
  /** Localized display values for the concept card. */
  style: string;
  palette: string;
  roomType: string;
  area: string;
  /** Palette swatch HEX values for the compact swatch row. */
  swatches: string[];
  /** Localized one-line description of what was generated. */
  promptSummary: string;
  /** Localized assumptions the generator made. */
  assumptions: string[];
  /** Provider id that produced this result, e.g. "openai" | "mock". */
  provider?: string;
  /** Model id used, e.g. "gpt-image-1" | "mock". */
  model?: string;
  /** True when the image is a local mock placeholder, not a generated image. */
  isMock?: boolean;
  /** True when OpenAI was selected but failed and we fell back to mock. */
  fellBack?: boolean;
  /** Concept variation that steered this generation (see design-variations.ts). */
  variationId?: string;
  variationTitleRu?: string;
  variationTitleEn?: string;
  /** Designer signature move applied (see designer-signatures.ts). Kept internal. */
  signatureId?: string;
  signatureTitleRu?: string;
  signatureTitleEn?: string;
  /** Vision analysis of the generated image — what is actually visible. */
  analysis?: DesignAnalysis;
  /** Legacy alias of `isMock`; kept for existing references. */
  isPlaceholder: boolean;
}

export interface ReportSection {
  title: string;
  items: string[];
}

export interface ReportHighlight {
  label: string;
  value: string;
}

/**
 * Visual preview attached to a report.
 * - `design`: the empty-room "AI room concept" image (the wow feature).
 * - `procurement`: the smaller design-project procurement-analysis block.
 * All string fields are already localized by the report generator.
 */
export interface DesignPreviewData {
  variant: "design" | "procurement";
  /** Local placeholder today; a generated image URL once a provider is wired in. */
  image: string;
  /** Localized style name (design variant only). */
  style?: string;
  /** Localized room type name (design variant only). */
  roomType?: string;
  /** Formatted area, e.g. "24 m²" (design variant only). */
  area?: string;
}

/** Mock AI report — will later be produced by a real AI API. */
export interface AIReport {
  kind: "estimate" | "concept";
  summary: string;
  /** Visual preview shown above the textual report. */
  preview?: DesignPreviewData;
  highlights: ReportHighlight[];
  palette?: { name: string; hex: string }[];
  sections: ReportSection[];
}
