/**
 * Designer Signature Idea layer (client-safe, pure — no imports).
 *
 * One clear, individual design "move" injected into every generation so each
 * concept feels custom rather than safe/generic — on top of the broader
 * design-variation direction. Selection is DETERMINISTIC (hash of room/style/
 * palette + variant), salted differently from the variation layer so the two
 * don't move in lockstep, and stable across React rerenders.
 */

export interface DesignerSignature {
  /** Stable id, e.g. "stone-tv-wall". Never shown to the user. */
  signatureId: string;
  titleRu: string;
  titleEn: string;
  /** English phrase describing the move; fed into the prompt. */
  promptText: string;
}

/** Curated, realistic signature moves (from the brief's examples). */
export const DESIGNER_SIGNATURES: DesignerSignature[] = [
  {
    signatureId: "stone-tv-wall",
    titleRu: "Каменная ТВ-стена с подсветкой",
    titleEn: "Stone TV wall with hidden lighting",
    promptText: "a warm stone TV/media wall with soft hidden LED lighting",
  },
  {
    signatureId: "reading-corner",
    titleRu: "Уголок для чтения",
    titleEn: "Reading corner",
    promptText: "a cozy reading corner with an armchair, a floor lamp and a small side table",
  },
  {
    signatureId: "abstract-artwork",
    titleRu: "Крупное абстрактное искусство",
    titleEn: "Large abstract artwork",
    promptText: "a large abstract artwork as the main focal point above the main seating",
  },
  {
    signatureId: "sculptural-center",
    titleRu: "Скульптурный центр зоны отдыха",
    titleEn: "Sculptural seating centre",
    promptText:
      "a sculptural coffee table paired with an organic-shaped rug at the centre of the seating area",
  },
  {
    signatureId: "sconce-pair",
    titleRu: "Пара бра у консоли или картины",
    titleEn: "Pair of framing wall sconces",
    promptText: "a symmetrical pair of wall sconces framing a console or an artwork",
  },
  {
    signatureId: "layered-lighting",
    titleRu: "Многослойный гостиничный свет",
    titleEn: "Layered hotel-style lighting",
    promptText: "a hotel-style layered lighting scenario with table lamps and warm accent lights",
  },
  {
    signatureId: "statement-chair",
    titleRu: "Акцентное кресло в контрастной ткани",
    titleEn: "Statement lounge chair",
    promptText: "a statement lounge chair in a tasteful contrasting fabric",
  },
  {
    signatureId: "gallery-wall",
    titleRu: "Галерейная арт-стена",
    titleEn: "Gallery art wall",
    promptText: "a gallery-style art wall with restrained, calm furniture",
  },
  {
    signatureId: "textile-layer",
    titleRu: "Тёплый текстильный слой",
    titleEn: "Soft textile layer",
    promptText: "a soft curtain and textile layer (throws and cushions) that warms up the room",
  },
  {
    signatureId: "vertical-plant",
    titleRu: "Крупное растение как вертикальный акцент",
    titleEn: "Tall plant accent",
    promptText: "a large indoor plant as a vertical green accent",
  },
  {
    signatureId: "console-mirror",
    titleRu: "Узкая консоль с зеркалом",
    titleEn: "Slim console with mirror",
    promptText: "a slim console with a mirror and a few curated decorative objects",
  },
  {
    signatureId: "textured-panel",
    titleRu: "Фактурная панель за диваном",
    titleEn: "Textured wall panel",
    promptText: "a textured wood or fluted wall panel behind the sofa or TV zone",
  },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export interface SignatureSelectInput {
  roomType: string;
  style: string;
  palette: string;
  variant: number;
}

/**
 * Deterministically pick a signature. Salted ("sig|") and using a different
 * multiplier than the variation layer so a given variant pairs a fresh signature
 * with its design direction; the variant number guarantees no repeat per step.
 */
export function getDesignerSignature(input: SignatureSelectInput): DesignerSignature {
  const base = hash(`sig|${input.roomType}|${input.style}|${input.palette}`);
  const idx = (base + Math.max(0, input.variant)) % DESIGNER_SIGNATURES.length;
  return DESIGNER_SIGNATURES[idx];
}

/** English prompt block for the selected signature move. */
export function signaturePromptText(sig: DesignerSignature, isRedesign: boolean): string {
  const lead =
    "Designer signature idea: add one clear, custom design move — " +
    `${sig.promptText} — optionally with one small complementary touch.`;
  const rules =
    "It must look intentional and realistic for a premium interior project, be clearly visible in the image, " +
    "improve the composition and atmosphere, and match the selected style and palette. " +
    "Do not overload the room, and do not create surreal, impossible or fantasy objects.";
  const redesignGuard = isRedesign
    ? "Implement it within the existing room shell only — do not change the architecture, camera angle, windows or doors."
    : "";
  return [lead, rules, redesignGuard].filter(Boolean).join(" ");
}
