/**
 * Basic usage / cost-protection limits for the AI module.
 *
 * Client-safe (plain constants, no imports). Shared by:
 *  - the AI assistant UI (session + per-result limits, upload validation)
 *  - the server design-service (upload size / type validation)
 *
 * These are the FIRST line of defense only. Before public production, real
 * server-side enforcement is still required — see the TODOs in
 * `src/lib/ai/design-service.ts` and the API route handlers.
 */

/** Max paid AI visualizations (generation + each regeneration) per browser session. */
export const MAX_GENERATIONS_PER_SESSION = 5;

/** Max "show another option" regenerations allowed for a single concept. */
export const MAX_REGENERATIONS_PER_RESULT = 3;

/** Max uploaded room photo size. */
export const MAX_UPLOAD_SIZE_MB = 10;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

/** Accepted room photo MIME types. */
export const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/** sessionStorage key used to count generations in the current browser session. */
export const SESSION_USAGE_KEY = "atelier_ai_generation_count";
