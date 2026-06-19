import type { Metadata } from "next";
import Image from "next/image";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteImages } from "@/lib/images";
import { ServiceCard } from "@/components/cards/service-card";
import { CTAButton } from "@/components/ui/cta-button";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.servicesPage.meta.title };
}

export default async function ServicesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  const dict = await getDictionary(locale);
  const t = dict.servicesPage;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
      <div className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-5 text-muted sm:text-lg">{t.subtitle}</p>
      </div>

      {/* Editorial banner */}
      <div className="relative mb-14 aspect-[16/9] overflow-hidden rounded-[1.75rem] sm:aspect-[21/8]">
        <Image
          src={siteImages.services.src}
          alt={siteImages.services.alt[locale]}
          fill
          sizes="(max-width: 1280px) 100vw, 1216px"
          className="object-cover"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.items.map((service, i) => (
          <ServiceCard key={service.title} index={i} title={service.title} text={service.text} />
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-charcoal px-8 py-14 text-center text-background sm:px-12">
        <h2 className="font-display mx-auto max-w-xl text-2xl font-medium tracking-tight text-balance sm:text-3xl">
          {t.ctaTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-background/60">{t.ctaText}</p>
        <div className="mt-8">
          <CTAButton href={`/${locale}/ai`} variant="light">
            {t.cta}
          </CTAButton>
        </div>
      </div>
    </main>
  );
}
