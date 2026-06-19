/**
 * OpenAI image provider (server-only).
 *
 * - parameters_to_design → images.generate (text-to-image)
 * - room_photo_redesign  → images.edit (uses the uploaded photo as reference)
 *
 * Never imported by client code. The API key is read from the server
 * environment and never returned to the client. On any failure the route
 * layer falls back to the mock provider.
 */
import OpenAI, { toFile } from "openai";
import { paletteSwatches } from "@/lib/data/palettes";
import {
  getDesignVariation,
  variationPromptText,
  type DesignVariation,
} from "@/lib/ai/design-variations";
import {
  getDesignerSignature,
  signaturePromptText,
  type DesignerSignature,
} from "@/lib/ai/designer-signatures";
import { buildConceptAssumptions, buildConceptSummary } from "./narrative";
import type {
  ImageProvider,
  ProviderGenerationInput,
  ProviderGenerationResult,
} from "./types";

/**
 * Default model. The brief specifies `gpt-image-2`; the currently shipping
 * OpenAI model is `gpt-image-1`. Set OPENAI_IMAGE_MODEL to override.
 */
const DEFAULT_MODEL = "gpt-image-1";

function model(): string {
  return process.env.OPENAI_IMAGE_MODEL || DEFAULT_MODEL;
}
function quality() {
  return (process.env.OPENAI_IMAGE_QUALITY || "medium") as "low" | "medium" | "high" | "auto";
}
function size() {
  return (process.env.OPENAI_IMAGE_SIZE || "1536x1024") as
    | "1024x1024"
    | "1536x1024"
    | "1024x1536"
    | "auto";
}

let cached: OpenAI | null = null;
function client(): OpenAI {
  if (!cached) cached = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return cached;
}

/** English style descriptors for the prompt (keys match reports.ts). */
const STYLE_PROMPT: Record<string, string> = {
  modern: "modern interior design, clean lines, a calm base with statement pieces, warm wood and matte finishes",
  minimalist: "minimalist interior, generous negative space, built-in storage, a few large pieces, serene and uncluttered",
  japandi: "Japandi interior, natural materials, low furniture silhouettes, linen and handmade ceramics, warm and calm",
  classic: "premium modern-classic interior, symmetrical composition, marble, brass and deep wood tones, refined mouldings",
  luxury: "contemporary luxury interior, refined materials, velvet, marble, brass and tinted glass, scenic layered lighting",
  loft: "loft interior, open plan, raw textures of concrete, metal and leather, oversized soft furniture",
  boutique: "boutique-hotel interior, cozy and tactile, full-height headboard, soft textiles, dimmed atmospheric lighting",
  "light-european": "light European interior, airy composition, pale wood, linen and matte surfaces, abundant natural light, minimal contrast",
};

const ROOM_PROMPT: Record<string, string> = {
  living: "a living room",
  bedroom: "a bedroom",
  kitchen: "a kitchen and dining area",
  office: "a home office",
  kids: "a kids' room",
  bathroom: "a bathroom",
};

/** Lighting & photography direction — keeps results bright, warm and editorial. */
const LIGHTING =
  "Bright but warm natural daylight, balanced and well-exposed — never dark or underexposed. " +
  "Soft natural shadows, no dark corners, avoid overly moody or dim lighting. " +
  "Premium editorial interior photography with a high-end architectural magazine look, " +
  "with clear visibility of every piece of furniture and the materials and finishes.";

/**
 * Structure lock for the room-photo redesign — keeps the result the SAME room,
 * not a different property. This is the most important part of the redesign prompt.
 */
const STRUCTURE_LOCK =
  "Preserve the original photo's room layout, geometry, camera angle and perspective, " +
  "and the placement of windows, doors, ceiling height, wall positions, columns and built-ins. " +
  "Keep the same room shell and main architecture clearly recognizable. " +
  "Do not alter the main architecture, do not move or remove structural elements, " +
  "and do not invent a completely different room or a different property. " +
  "Keep any exterior view through the windows essentially the same — do not change it aggressively.";

/** Anti-artifact guards — realistic, restrained, no surreal output. */
const QUALITY_GUARDS =
  "Use realistic furniture scale and natural circulation space. " +
  "Avoid weird or distorted furniture, duplicated or repeated objects, " +
  "excessive clutter or decor, and any surreal or impossible elements.";

const NEGATIVES = "No people, no text, no logos, no watermark, no captions or labels of any kind.";
const DISCLAIMER = "This is a preliminary visualization concept for a client, not a final design.";

function colors(input: ProviderGenerationInput): string {
  return paletteSwatches(input.palette, "en")
    .map((s) => s.name)
    .join(", ");
}

/** Dimensions, budget tier and user constraints (no variation phrasing). */
function commonDetails(input: ProviderGenerationInput): string {
  const d = input.dimensions;
  const dims = `Approx ${d.area} m² (${d.length}×${d.width} m, ceiling ${d.height} m), ${d.windows} window(s), ${d.doors} door(s).`;
  const budget = input.budget ? ` Budget guidance tier: ${input.budget}.` : "";
  const constraints = input.constraints ? ` Constraints to respect: ${input.constraints}.` : "";
  return `${dims}${budget}${constraints}`;
}

function buildParametersPrompt(
  input: ProviderGenerationInput,
  variation: DesignVariation,
  signature: DesignerSignature
): string {
  const style = STYLE_PROMPT[input.style] ?? STYLE_PROMPT.modern;
  const room = ROOM_PROMPT[input.roomType] ?? "an interior room";
  return [
    `Generate a premium ${style} for ${room}.`,
    `Color palette: ${colors(input)}.`,
    "Photorealistic professional interior photography, realistic furniture scale and a believable layout, high-end finishes.",
    variationPromptText(variation, false),
    signaturePromptText(signature, false),
    QUALITY_GUARDS,
    LIGHTING,
    commonDetails(input),
    NEGATIVES,
    DISCLAIMER,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildRedesignPrompt(
  input: ProviderGenerationInput,
  variation: DesignVariation,
  signature: DesignerSignature
): string {
  const style = STYLE_PROMPT[input.style] ?? STYLE_PROMPT.modern;
  return [
    "Redesign the interior of THIS exact room from the provided photo — " +
      "make it look like a professional interior design concept applied to this same room.",
    STRUCTURE_LOCK,
    `Restyle it as a premium ${style}.`,
    `Color palette: ${colors(input)}.`,
    "Add and arrange furniture, lighting, textiles, decor and finishes that suit this room and style; keep proportions realistic.",
    variationPromptText(variation, true),
    signaturePromptText(signature, true),
    QUALITY_GUARDS,
    LIGHTING,
    commonDetails(input),
    NEGATIVES,
    DISCLAIMER,
  ]
    .filter(Boolean)
    .join(" ");
}

function dataUrl(b64: string): string {
  return `data:image/png;base64,${b64}`;
}

function result(
  input: ProviderGenerationInput,
  imageUrl: string,
  variation: DesignVariation,
  signature: DesignerSignature
): ProviderGenerationResult {
  return {
    imageUrl,
    provider: "openai",
    model: model(),
    promptSummary: buildConceptSummary(input),
    assumptions: buildConceptAssumptions(input),
    variant: input.variant,
    variationId: variation.variationId,
    variationTitleRu: variation.titleRu,
    variationTitleEn: variation.titleEn,
    signatureId: signature.signatureId,
    signatureTitleRu: signature.titleRu,
    signatureTitleEn: signature.titleEn,
    isMock: false,
    status: "ready",
  };
}

function pickVariation(input: ProviderGenerationInput): DesignVariation {
  return getDesignVariation({
    roomType: input.roomType,
    style: input.style,
    palette: input.palette,
    mode: input.mode,
    variant: input.variant,
  });
}

function pickSignature(input: ProviderGenerationInput): DesignerSignature {
  return getDesignerSignature({
    roomType: input.roomType,
    style: input.style,
    palette: input.palette,
    variant: input.variant,
  });
}

async function generate(input: ProviderGenerationInput): Promise<ProviderGenerationResult> {
  const variation = pickVariation(input);
  const signature = pickSignature(input);
  const res = await client().images.generate({
    model: model(),
    prompt: buildParametersPrompt(input, variation, signature),
    size: size(),
    quality: quality(),
    n: 1,
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data (generate)");
  return result(input, dataUrl(b64), variation, signature);
}

async function redesign(input: ProviderGenerationInput): Promise<ProviderGenerationResult> {
  if (!input.originalImage) throw new Error("redesign requires an uploaded image");
  const variation = pickVariation(input);
  const signature = pickSignature(input);
  const image = await toFile(input.originalImage.data, input.originalImage.filename || "room.png", {
    type: input.originalImage.mimeType,
  });
  const res = await client().images.edit({
    model: model(),
    image,
    prompt: buildRedesignPrompt(input, variation, signature),
    size: size(),
    quality: quality(),
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data (edit)");
  return result(input, dataUrl(b64), variation, signature);
}

export const openAiImageProvider: ImageProvider = {
  id: "openai",
  generateInteriorFromParameters: generate,
  redesignRoomFromPhoto: redesign,
  regenerateDesignVariant: (input) =>
    input.mode === "room_photo_redesign" ? redesign(input) : generate(input),
};
