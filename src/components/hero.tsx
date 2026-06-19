import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { siteImages } from "@/lib/images";
import { CTAButton } from "@/components/ui/cta-button";

export function Hero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["home"]["hero"];
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-20 sm:px-10 lg:pt-20 lg:pb-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Editorial copy */}
        <div>
          <p className="mb-6 text-xs font-medium tracking-[0.3em] text-bronze uppercase">
            {dict.eyebrow}
          </p>
          <h1 className="font-display text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {dict.title}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
            {dict.subtitle}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <CTAButton href={`/${locale}/ai`}>{dict.primaryCta}</CTAButton>
            <CTAButton href={`/${locale}/projects`} variant="outline">
              {dict.secondaryCta}
            </CTAButton>
          </div>
        </div>

        {/* Hero imagery */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] sm:aspect-[5/5.5]">
            <Image
              src={siteImages.hero.src}
              alt={siteImages.hero.alt[locale]}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          {/* Architectural framing accent */}
          <div
            aria-hidden
            className="absolute -right-4 -bottom-4 -z-10 hidden h-full w-full rounded-[1.75rem] border border-accent/40 lg:block"
          />
        </div>
      </div>

      {/* Stats strip */}
      <dl className="mt-16 grid grid-cols-1 gap-8 border-t border-border pt-10 sm:grid-cols-3 lg:mt-20">
        {dict.stats.map((stat) => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd className="font-display text-3xl font-medium text-bronze">
              {stat.value}
            </dd>
            <dd className="mt-2 max-w-[16rem] text-sm text-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
