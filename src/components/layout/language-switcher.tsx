"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

/** Switches locale while preserving the current path. */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "/";
  // Strip the leading locale segment, keep the rest of the path.
  const rest = pathname.replace(/^\/(ru|en)(?=\/|$)/, "");

  // Russian is the default locale → bare base path (no /ru). English → /en.
  // Next.js basePath adds the /app prefix automatically.
  const hrefFor = (l: Locale) => {
    if (l === "ru") return rest === "" ? "/" : rest;
    return `/en${rest}`;
  };

  return (
    <div className="flex items-center rounded-full border border-border bg-surface p-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={hrefFor(l)}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-colors ${
            l === locale
              ? "btn-gold"
              : "text-muted hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
