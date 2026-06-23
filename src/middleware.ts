import { NextRequest, NextResponse } from "next/server";

/*
 * Routing for the AI tool mounted at /app (basePath).
 * Middleware paths are WITHOUT the basePath (Next strips it first).
 *
 * Public URL structure:
 *   /app        → Russian tool   (internal "/", rewritten to "/ru")
 *   /app/en     → English tool   (internal "/en")
 *   /app/ru     → redirect to /app   (Russian is default, never shown)
 *   /app/{l}/ai → redirect to clean tool URL (legacy)
 *   marketing sections → the main website (no duplicate marketing here)
 */

const MAIN_SITE = "https://ateliersupply.ru";

const MAIN_SITE_SECTIONS: Record<string, string> = {
  services: `${MAIN_SITE}/services.html`,
  projects: `${MAIN_SITE}/projects.html`,
  process: `${MAIN_SITE}/process.html`,
  contacts: `${MAIN_SITE}/contacts.html`,
  about: `${MAIN_SITE}/`,
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl; // without basePath
  const segs = pathname.split("/").filter(Boolean);
  const first = segs[0];
  const hasLocale = first === "ru" || first === "en";
  const section = hasLocale ? segs[1] : first;

  // 1. Marketing sections (with or without a locale prefix) → main website.
  if (section && MAIN_SITE_SECTIONS[section]) {
    return NextResponse.redirect(MAIN_SITE_SECTIONS[section]);
  }

  // 2. Legacy /{locale}/ai → clean tool URL.
  if (hasLocale && section === "ai") {
    const url = request.nextUrl.clone();
    url.pathname = first === "en" ? "/en" : "/";
    return NextResponse.redirect(url);
  }

  // 3. /ru (tool index) → "/"  (Russian is the default, never shown in the URL).
  //    The bare root "/" is served directly by app/page.tsx (Russian tool).
  if (first === "ru" && segs.length === 1) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 4. Everything else (bare root, /en tool, /{locale}/dashboard|admin, …) → render.
  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals, API route handlers, and static files.
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
