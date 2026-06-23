import type { Metadata } from "next";
import { locales, toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SiteShell } from "@/components/site-shell";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return {
    title: {
      default: dict.common.meta.title,
      template: "%s — Atelier Supply",
    },
    description: dict.common.meta.description,
  };
}

// Nested layout for the locale subtree (/app/en, …). <html>/<body>/fonts live
// in the root layout; here we only add the shared chrome (Header + Footer).
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  return <SiteShell locale={locale}>{children}</SiteShell>;
}
