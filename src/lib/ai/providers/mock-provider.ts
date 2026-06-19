/**
 * Mock image provider — the always-available fallback.
 *
 * Deterministically picks a curated local interior that VARIES by room type,
 * style, palette and regeneration variant, so the output is never a single
 * static placeholder. No network calls. Used when AI_IMAGE_PROVIDER=mock, when
 * OPENAI_API_KEY is missing, or when the OpenAI provider fails.
 */
import { PALETTE_KEYS } from "@/lib/data/palettes";
import { getDesignVariation } from "@/lib/ai/design-variations";
import { getDesignerSignature } from "@/lib/ai/designer-signatures";
import { buildConceptAssumptions, buildConceptSummary } from "./narrative";
import type {
  ImageProvider,
  ProviderGenerationInput,
  ProviderGenerationResult,
  ProviderMode,
} from "./types";

/** Curated local interiors used as generation stand-ins. */
const IMG = {
  hero: "/images/hero-main.webp",
  modernApartment: "/images/project-modern-apartment.webp",
  luxuryVilla: "/images/project-luxury-villa.webp",
  minimalistKitchen: "/images/project-minimalist-kitchen.webp",
  boutiqueHotel: "/images/project-boutique-hotel-room.webp",
  officeLounge: "/images/project-office-lounge.webp",
  warmInterior: "/images/about-image.webp",
} as const;

const ALL_INTERIORS = [
  IMG.hero,
  IMG.modernApartment,
  IMG.luxuryVilla,
  IMG.minimalistKitchen,
  IMG.boutiqueHotel,
  IMG.officeLounge,
  IMG.warmInterior,
];

/** Best-first candidate list anchored by room type, then style, then the rest. */
function orderedCandidates(roomType: string, style: string): string[] {
  const pref: string[] = [];
  const add = (...xs: string[]) => xs.forEach((x) => !pref.includes(x) && pref.push(x));

  switch (roomType) {
    case "kitchen":
      add(IMG.minimalistKitchen, IMG.modernApartment);
      break;
    case "office":
      add(IMG.officeLounge, IMG.modernApartment);
      break;
    case "bedroom":
      add(IMG.boutiqueHotel, IMG.hero);
      break;
    case "bathroom":
      add(IMG.minimalistKitchen, IMG.warmInterior);
      break;
  }

  switch (style) {
    case "minimalist":
      add(IMG.minimalistKitchen, IMG.modernApartment);
      break;
    case "luxury":
    case "classic":
      add(IMG.luxuryVilla, IMG.hero);
      break;
    case "boutique":
      add(IMG.boutiqueHotel, IMG.luxuryVilla);
      break;
    case "loft":
      add(IMG.modernApartment, IMG.warmInterior);
      break;
    default: // modern, japandi, light-european
      add(IMG.hero, IMG.modernApartment);
      break;
  }

  add(...ALL_INTERIORS);
  return pref;
}

/** Deterministic image pick that varies by room, style, palette and variant. */
function pickImage(input: ProviderGenerationInput): string {
  const candidates = orderedCandidates(input.roomType, input.style);
  const paletteIdx = Math.max(
    0,
    PALETTE_KEYS.indexOf(input.palette as (typeof PALETTE_KEYS)[number])
  );
  const idx = (input.variant + paletteIdx) % candidates.length;
  return candidates[idx];
}

function buildMockResult(
  input: ProviderGenerationInput,
  mode: ProviderMode
): ProviderGenerationResult {
  const resolved: ProviderGenerationInput = { ...input, mode };
  const variation = getDesignVariation({
    roomType: resolved.roomType,
    style: resolved.style,
    palette: resolved.palette,
    mode: resolved.mode,
    variant: resolved.variant,
  });
  const signature = getDesignerSignature({
    roomType: resolved.roomType,
    style: resolved.style,
    palette: resolved.palette,
    variant: resolved.variant,
  });
  return {
    imageUrl: pickImage(resolved),
    provider: "mock",
    model: "mock",
    promptSummary: buildConceptSummary(resolved),
    assumptions: buildConceptAssumptions(resolved),
    variant: resolved.variant,
    variationId: variation.variationId,
    variationTitleRu: variation.titleRu,
    variationTitleEn: variation.titleEn,
    signatureId: signature.signatureId,
    signatureTitleRu: signature.titleRu,
    signatureTitleEn: signature.titleEn,
    isMock: true,
    status: "ready",
  };
}

export const mockImageProvider: ImageProvider = {
  id: "mock",
  async generateInteriorFromParameters(input) {
    return buildMockResult(input, "parameters_to_design");
  },
  async redesignRoomFromPhoto(input) {
    return buildMockResult(input, "room_photo_redesign");
  },
  async regenerateDesignVariant(input) {
    // Keep the same mode; the caller has already incremented `variant`.
    return buildMockResult(input, input.mode);
  },
};
