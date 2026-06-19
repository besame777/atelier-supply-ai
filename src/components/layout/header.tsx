"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "./language-switcher";

const NAV_ITEMS = [
  { key: "ai", path: "/ai" },
  { key: "projects", path: "/projects" },
  { key: "services", path: "/services" },
  { key: "process", path: "/process" },
  { key: "about", path: "/about" },
  { key: "contacts", path: "/contacts" },
] as const;

export function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["common"];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";

  const isActive = (path: string) =>
    pathname === `/${locale}${path}` || pathname.startsWith(`/${locale}${path}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-header backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 sm:px-10">
        <Link
          href={`/${locale}`}
          className="font-display text-lg font-semibold tracking-wide"
          onClick={() => setOpen(false)}
        >
          {dict.brand}
          <span className="ml-1.5 align-middle text-[10px] font-sans font-semibold tracking-[0.2em] text-accent uppercase">
            AI
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.path}`}
              className={`text-sm transition-colors ${
                isActive(item.path)
                  ? "font-medium text-bronze"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/ai`}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-brown"
          >
            {dict.cta.start}
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 lg:hidden">
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-border"
          >
            <span
              className={`block h-px w-4 bg-foreground transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-4 bg-foreground transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-6 pt-2 pb-6 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.path}`}
              onClick={() => setOpen(false)}
              className={`block border-b border-border/60 py-3.5 text-base ${
                isActive(item.path) ? "font-medium text-foreground" : "text-muted"
              }`}
            >
              {dict.nav[item.key]}
            </Link>
          ))}
          <Link
            href={`/${locale}/ai`}
            onClick={() => setOpen(false)}
            className="mt-5 block rounded-full bg-foreground px-5 py-3 text-center text-sm font-medium text-background"
          >
            {dict.cta.start}
          </Link>
        </nav>
      )}
    </header>
  );
}
