import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Shared chrome for the AI tool: minimal Header + Footer around the page
 * content. Used by both the root (Russian, /app) and the [locale] subtree
 * (/app/en) so the layout is defined in exactly one place.
 */
export async function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dict = await getDictionary(locale);
  return (
    <>
      <Header locale={locale} dict={dict.common} />
      {children}
      <Footer locale={locale} dict={dict.common} />
    </>
  );
}
