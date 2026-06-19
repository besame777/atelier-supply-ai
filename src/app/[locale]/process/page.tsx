import type { Metadata } from "next";
import Image from "next/image";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteImages } from "@/lib/images";
import { ProcessStep } from "@/components/cards/process-step";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.processPage.meta.title };
}

export default async function ProcessPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  const dict = await getDictionary(locale);
  const t = dict.processPage;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
      <div className="mb-16 max-w-2xl">
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-5 text-muted sm:text-lg">{t.subtitle}</p>
      </div>

      <div className="grid gap-14 lg:grid-cols-[1fr_0.75fr] lg:gap-20">
        <div>
          {t.steps.map((step, i) => (
            <ProcessStep
              key={step.title}
              index={i}
              title={step.title}
              text={step.text}
              isLast={i === t.steps.length - 1}
            />
          ))}

          <p className="mt-12 rounded-2xl border border-accent/30 bg-beige/60 p-6 text-sm leading-relaxed text-foreground/80">
            {t.note}
          </p>
        </div>

        {/* Editorial side imagery */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem]">
              <Image
                src={siteImages.process.src}
                alt={siteImages.process.alt[locale]}
                fill
                sizes="32vw"
                className="object-cover"
              />
            </div>
            <div
              aria-hidden
              className="mt-5 h-px w-full bg-border"
            />
            <p className="mt-5 text-xs leading-relaxed tracking-wide text-muted uppercase">
              Atelier Supply
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
