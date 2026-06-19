import type { Metadata } from "next";
import Image from "next/image";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { siteImages } from "@/lib/images";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.aboutPage.meta.title };
}

export default async function AboutPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  const dict = await getDictionary(locale);
  const t = dict.aboutPage;

  return (
    <main>
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
        <h1 className="font-display max-w-3xl text-4xl font-medium tracking-tight text-balance sm:text-6xl">
          {t.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{t.subtitle}</p>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {t.paragraphs.map((p) => (
              <p key={p} className="leading-relaxed text-foreground/80 sm:text-lg">
                {p}
              </p>
            ))}
          </div>

          <div className="space-y-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={siteImages.about.src}
                alt={siteImages.about.alt[locale]}
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-cover"
              />
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {t.stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-surface p-6">
                  <dd className="font-display text-2xl font-medium text-bronze sm:text-3xl">
                    {s.value}
                  </dd>
                  <dt className="mt-2 text-sm text-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-on-dark">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-24">
          <h2 className="font-display text-3xl font-medium tracking-tight">{t.valuesTitle}</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-on-dark/10 lg:grid-cols-3">
            {t.values.map((v, i) => (
              <div key={v.title} className="bg-charcoal p-8 sm:p-10">
                <span className="font-display text-sm text-accent-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-4 text-xl font-medium">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-on-dark/60">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
