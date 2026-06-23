import type { Metadata } from "next";
import { defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SiteShell } from "@/components/site-shell";
import { ToolScreen } from "@/components/tool-screen";

// Russian tool, served directly at the base path (/app) — no /ru in the URL.
export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(defaultLocale);
  return { title: dict.ai.meta.title };
}

export default function RootToolPage() {
  return (
    <SiteShell locale={defaultLocale}>
      <ToolScreen locale={defaultLocale} />
    </SiteShell>
  );
}
