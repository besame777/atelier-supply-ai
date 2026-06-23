/**
 * Base path the app is mounted under (Next.js `basePath`, e.g. "/app").
 *
 * Next.js auto-prefixes `<Link>`, router navigation, `next/image` and static
 * assets — do NOT prefix those manually. This helper is ONLY for raw string
 * URLs that Next.js does not touch: client `fetch()` to Route Handlers.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix an app-absolute path (e.g. "/api/...") with the base path. */
export function withBasePath(path: string): string {
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${p}`;
}
