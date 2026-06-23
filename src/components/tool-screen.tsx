import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { AIAssistant } from "@/components/ai/ai-assistant";

/**
 * The AI tool screen (intro + assistant wizard). Shared by the Russian root
 * route (/app) and the English route (/app/en) so there is no duplicate markup.
 */
export async function ToolScreen({ locale }: { locale: Locale }) {
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
