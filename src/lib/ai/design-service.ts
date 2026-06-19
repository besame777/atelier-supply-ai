/**
 * Server-side design generation service.
 *
 * Parses the API request into a provider input, runs the active image provider
 * with a mock fallback, and assembles the `DesignGenerationResult` the UI uses.
 * Shared by the generate and regenerate route handlers.
 */
import type { NextRequest } from "next/server";
import { isLocale, type Locale } from "@/i18n/config";
import type { DesignGenerationResult, GenerationMode } from "@/lib/types";
import { PALETTES } from "@/lib/data/palettes";
import {
  getImageProvider,
  mockImageProvider,
  type ImageProvider,
  type ProviderGenerationInput,
  type ProviderMode,
  type UploadedImage,
} from "@/lib/ai/providers";
import { analyzeGeneratedDesign, mockDesignAnalysis } from "@/lib/ai/design-analysis";
import type { DesignAnalysis } from "@/lib/types";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@/lib/ai/usage-limits";

/*
 * TODO (before public production — these paid OpenAI calls need server-side
 * protection; the client session limit in usage-limits.ts is not enough):
 *   - Rate limiting per IP / session / authenticated user on both routes.
 *   - A daily/global OpenAI spend (budget) cap with a graceful "limit reached" response.
 *   - CAPTCHA or phone/contact capture BEFORE the first paid generation.
 *   - Abuse monitoring/alerting (volume, cost, fallback rate, error spikes).
 */

export interface ParsedRequestError {
  ok: false;
  status: number;
  code: string;
}
export interface ParsedRequestOk {
  ok: true;
  input: ProviderGenerationInput;
}
export type ParsedRequest = ParsedRequestOk | ParsedRequestError;

type FieldGetter = (key: string) => string;

function num(get: FieldGetter, key: string, fallback: number): number {
  const v = Number(get(key));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function buildInput(
  get: FieldGetter,
  mode: ProviderMode,
  originalImage?: UploadedImage
): ProviderGenerationInput {
  const rawLocale = get("locale");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "ru";
  const length = num(get, "length", 5);
  const width = num(get, "width", 4);
  const height = num(get, "height", 2.8);
  const area = Math.max(1, Math.round(length * width * 10) / 10);
  const variant = Math.max(0, Math.trunc(Number(get("variant")) || 0));

  return {
    mode,
    style: get("style") || "modern",
    palette: get("palette") || "warm-neutral",
    roomType: get("roomType") || "living",
    dimensions: {
      length,
      width,
      height,
      windows: Math.max(0, Math.trunc(Number(get("windows")) || 0)),
      doors: Math.max(0, Math.trunc(Number(get("doors")) || 0)),
      area,
    },
    budget: get("budget") || "",
    constraints: get("constraints") || "",
    variant,
    locale,
    labels: {
      style: get("labelStyle") || get("style") || "",
      palette: get("labelPalette") || get("palette") || "",
      roomType: get("labelRoomType") || get("roomType") || "",
    },
    originalImage,
  };
}

/** Parse a generate/regenerate request (multipart with image, or JSON). */
export async function parseGenerationRequest(req: NextRequest): Promise<ParsedRequest> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const get: FieldGetter = (k) => {
      const v = form.get(k);
      return typeof v === "string" ? v : "";
    };

    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { ok: false, status: 415, code: "unsupported_image_type" };
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return { ok: false, status: 413, code: "image_too_large" };
      }
      const data = Buffer.from(await file.arrayBuffer());
      const uploaded: UploadedImage = {
        data,
        mimeType: file.type,
        filename: file.name || "room.png",
      };
      return { ok: true, input: buildInput(get, "room_photo_redesign", uploaded) };
    }
    // multipart without a (valid) image → parameters mode
    return { ok: true, input: buildInput(get, "parameters_to_design") };
  }

  // JSON body (no image) → parameters mode
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, status: 400, code: "invalid_json" };
  }
  const get: FieldGetter = (k) => {
    const v = body[k];
    return v === undefined || v === null ? "" : String(v);
  };
  return { ok: true, input: buildInput(get, "parameters_to_design") };
}

function toUiMode(mode: ProviderMode): GenerationMode {
  return mode === "room_photo_redesign" ? "redesign" : "from-parameters";
}

type Action = "generate" | "regenerate";

function callProvider(
  provider: ImageProvider,
  input: ProviderGenerationInput,
  action: Action
) {
  if (action === "regenerate") return provider.regenerateDesignVariant(input);
  return input.mode === "room_photo_redesign"
    ? provider.redesignRoomFromPhoto(input)
    : provider.generateInteriorFromParameters(input);
}

/**
 * Run the active provider with a mock fallback, returning the UI result shape.
 * `originalImage` (the uploaded photo URL) is set client-side, not here.
 */
export async function runGeneration(
  input: ProviderGenerationInput,
  action: Action
): Promise<DesignGenerationResult> {
  const provider = getImageProvider();
  let fellBack = false;
  let providerResult;

  try {
    providerResult = await callProvider(provider, input, action);
  } catch (err) {
    // Detailed error stays on the server only.
    console.error(`[ai/design] provider "${provider.id}" ${action} failed:`, err);
    if (provider.id === "mock") throw err; // mock failing is unexpected → surface 500
    providerResult = await callProvider(mockImageProvider, input, action);
    fellBack = true;
  }

  const swatches = (PALETTES[input.palette] ?? PALETTES["warm-neutral"]).map((s) => s.hex);

  // Second pass: describe what is actually visible in the generated image.
  // Only when we have a real generated image (data URL); otherwise demo analysis.
  let analysis: DesignAnalysis;
  if (!providerResult.isMock && providerResult.imageUrl.startsWith("data:")) {
    try {
      analysis = await analyzeGeneratedDesign({
        generatedImage: providerResult.imageUrl,
        originalImage: input.originalImage,
        input,
      });
    } catch (err) {
      console.error("[ai/design] vision analysis failed, using demo analysis:", err);
      analysis = mockDesignAnalysis(input);
    }
  } else {
    analysis = mockDesignAnalysis(input);
  }

  return {
    mode: toUiMode(input.mode),
    status: providerResult.status,
    variant: providerResult.variant,
    previewImage: providerResult.imageUrl,
    style: input.labels.style,
    palette: input.labels.palette,
    roomType: input.labels.roomType,
    area: `${input.dimensions.area} ${input.locale === "ru" ? "м²" : "m²"}`,
    swatches,
    promptSummary: providerResult.promptSummary,
    assumptions: providerResult.assumptions,
    provider: providerResult.provider,
    model: providerResult.model,
    isMock: providerResult.isMock,
    fellBack,
    variationId: providerResult.variationId,
    variationTitleRu: providerResult.variationTitleRu,
    variationTitleEn: providerResult.variationTitleEn,
    signatureId: providerResult.signatureId,
    signatureTitleRu: providerResult.signatureTitleRu,
    signatureTitleEn: providerResult.signatureTitleEn,
    analysis,
    isPlaceholder: providerResult.isMock,
  };
}
