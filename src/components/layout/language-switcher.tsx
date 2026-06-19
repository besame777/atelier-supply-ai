"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

/** Switches locale while preserving the current path. */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "/";
  // Strip the leading locale segment, keep the rest of the path.
  const rest = pathname.replace(/^\/(ru|en)(?=\/|$)/, "");

  return (
    <div className="flex items-center rounded-full border border-border bg-surface p-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-colors ${
            l === locale
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
