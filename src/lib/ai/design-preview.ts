/**
 * Procurement-analysis preview image for the design-project flow.
 *
 * Room-concept generation (empty-room redesign / from-parameters) now lives in
 * `src/lib/ai/design-generation.ts`. This module only provides the small static
 * image used by the procurement-analysis block, which is an analysis preview —
 * not a generated room design.
 */

/** Image used for the design-project procurement-analysis preview block. */
export function getProcurementPreviewImage(): string {
  return "/images/services-image.webp";
}
