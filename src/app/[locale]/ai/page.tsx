import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { AIAssistant } from "@/components/ai/ai-assistant";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.ai.meta.title };
}

export default async function AIPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:py-24">
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] text-accent uppercase">
          {dict.ai.intro.eyebrow}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-balance sm:text-5xl">
          {dict.ai.intro.title}
        </h1>
        <p className="mt-5 text-muted sm:text-lg">{dict.ai.intro.subtitle}</p>
      </div>

      <AIAssistant
        locale={locale}
        dict={dict.ai}
        preliminaryBadge={dict.common.preliminaryBadge}
        preliminaryNote={dict.common.preliminaryNote}
      />
    </main>
  );
}
