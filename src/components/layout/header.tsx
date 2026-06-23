import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "./language-switcher";

// Root of the main domain, OUTSIDE the /app base path. A raw <a href="/"> is
// NOT rewritten by Next.js basePath, so it correctly leaves the AI tool.
const MAIN_SITE = "/";

export function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["common"];
}) {
  const backToMain = locale === "ru" ? "На основной сайт" : "Back to main site";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
        {/* Brand → tool home (clean locale index) */}
        <Link
          href={locale === "en" ? "/en" : "/"}
          className="font-sans text-sm font-extrabold uppercase tracking-[0.2em] text-foreground sm:text-base sm:tracking-[0.22em]"
        >
          {dict.brand}
          <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Concept
          </span>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-4">
          <LanguageSwitcher locale={locale} />
          <a
            href={MAIN_SITE}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground sm:text-sm"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            <span className="hidden sm:inline">{backToMain}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
