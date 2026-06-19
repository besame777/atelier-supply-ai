/**
 * Image-generation provider contract.
 *
 * Providers run ONLY on the server (route handlers). The mock provider is the
 * always-available fallback; the OpenAI provider is used when configured and a
 * key is present. The API route maps the provider result into the richer
 * `DesignGenerationResult` consumed by the UI, so swapping providers never
 * touches the wizard.
 */
import type { Locale } from "@/i18n/config";

/** Generation mode at the provider boundary. */
export type ProviderMode = "room_photo_redesign" | "parameters_to_design";

export interface ProviderDimensions {
  length: number;
  width: number;
  height: number;
  windows: number;
  doors: number;
  /** Derived floor area in m². */
  area: number;
}

/** Already-localized display names (sourced from the RU/EN dictionaries). */
export interface ProviderLabels {
  style: string;
  palette: string;
  roomType: string;
}

/** Raw uploaded photo bytes — present only for room_photo_redesign. */
export interface UploadedImage {
  data: Buffer;
  mimeType: string;
  filename: string;
}

export interface ProviderGenerationInput {
  mode: ProviderMode;
  /** Style key (see reports.ts) — used to build the prompt. */
  style: string;
  /** Palette key (see palettes.ts) — used to build the prompt. */
  palette: string;
  roomType: string;
  dimensions: ProviderDimensions;
  budget: string;
  /** User constraints / comment. */
  constraints: string;
  /** 0-based regeneration attempt; 0 = first variant. */
  variant: number;
  locale: Locale;
  labels: ProviderLabels;
  /** Uploaded room photo (redesign mode only). */
  originalImage?: UploadedImage;
}

export interface ProviderGenerationResult {
  /** Remote URL or, preferably, a base64 data URL of the generated image. */
  imageUrl: string;
  /** Provider id, e.g. "openai" | "mock". */
  provider: string;
  /** Model id, or "mock". */
  model: string;
  /** Localized one-line summary of what was generated. */
  promptSummary: string;
  /** Localized assumptions the generation made. */
  assumptions: string[];
  /** 0-based variant index for this result. */
  variant: number;
  /** Concept variation that steered this generation (see design-variations.ts). */
  variationId?: string;
  variationTitleRu?: string;
  variationTitleEn?: string;
  /** Designer signature move applied (see designer-signatures.ts). */
  signatureId?: string;
  signatureTitleRu?: string;
  signatureTitleEn?: string;
  /** True when the image is a local placeholder, not a generated image. */
  isMock: boolean;
  status: "ready" | "error";
}

/** Server-side image-generation provider. */
export interface ImageProvider {
  readonly id: string;
  generateInteriorFromParameters(
    input: ProviderGenerationInput
  ): Promise<ProviderGenerationResult>;
  redesignRoomFromPhoto(
    input: ProviderGenerationInput
  ): Promise<ProviderGenerationResult>;
  regenerateDesignVariant(
    input: ProviderGenerationInput
  ): Promise<ProviderGenerationResult>;
}
