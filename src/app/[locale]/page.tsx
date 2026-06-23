import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ToolScreen } from "@/components/tool-screen";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.ai.meta.title };
}

// Locale index: /app/en → English tool. (Russian is served at the root /app.)
export default async function LocaleToolPage({ params }: Props) {
  const { locale: raw } = await params;
  return <ToolScreen locale={toLocale(raw)} />;
}
