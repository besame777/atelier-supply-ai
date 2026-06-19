import type { Metadata } from "next";
import Link from "next/link";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { projects } from "@/lib/data/projects";
import { Hero } from "@/components/hero";
import { SectionHeader } from "@/components/ui/section-header";
import { CTAButton } from "@/components/ui/cta-button";
import { ScenarioCard } from "@/components/cards/scenario-card";
import { ProjectCard } from "@/components/cards/project-card";
import { FAQ } from "@/components/ui/faq";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.home.meta.title };
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  const dict = await getDictionary(locale);
  const home = dict.home;

  return (
    <main>
      <Hero locale={locale} dict={home.hero} />

      {/* Two AI scenarios */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
        <SectionHeader title={home.scenarios.title} subtitle={home.scenarios.subtitle} />
        <div className="grid gap-5 lg:grid-cols-2">
          <ScenarioCard
            title={home.scenarios.project.title}
            text={home.scenarios.project.text}
            ctaLabel={home.scenarios.project.cta}
            href={`/${locale}/ai`}
          />
          <ScenarioCard
            title={home.scenarios.room.title}
            text={home.scenarios.room.text}
            ctaLabel={home.scenarios.room.cta}
            href={`/${locale}/ai`}
          />
        </div>
      </section>

      {/* Why China sourcing — dark editorial band */}
      <section className="bg-charcoal text-background">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
              {home.whyChina.title}
            </h2>
            <p className="mt-4 text-base text-background/60 sm:text-lg">
              {home.whyChina.subtitle}
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl bg-background/10 sm:grid-cols-2 lg:grid-cols-4">
            {home.whyChina.items.map((item, i) => (
              <div key={item.title} className="bg-charcoal p-8">
                <span className="font-display text-sm text-accent-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
        <SectionHeader title={home.how.title} subtitle={home.how.subtitle} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {home.how.steps.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-border bg-surface p-7">
              <span className="font-display flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 text-sm font-medium text-bronze">
                {i + 1}
              </span>
              <h3 className="mt-5 font-medium">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href={`/${locale}/process`}
            className="text-sm font-medium text-bronze transition-colors hover:text-accent"
          >
            {home.how.cta} →
          </Link>
        </div>
      </section>

      {/* Featured projects */}
      <section className="bg-beige/40">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader title={home.projects.title} subtitle={home.projects.subtitle} />
            <Link
              href={`/${locale}/projects`}
              className="mb-12 hidden text-sm font-medium text-bronze transition-colors hover:text-accent sm:block"
            >
              {dict.common.cta.viewAll} →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project, i) => (
              <ProjectCard key={project.slug} project={project} locale={locale} index={i} />
            ))}
          </div>
          <div className="mt-8 sm:hidden">
            <Link
              href={`/${locale}/projects`}
              className="text-sm font-medium text-bronze hover:text-accent"
            >
              {dict.common.cta.viewAll} →
            </Link>
          </div>
        </div>
      </section>

      {/* For homeowners / For designers */}
      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-20 sm:px-10 lg:grid-cols-2 lg:py-28">
        {[home.homeowners, home.designers].map((block) => (
          <div
            key={block.eyebrow}
            className="flex flex-col rounded-3xl border border-border bg-surface p-8 sm:p-12"
          >
            <p className="text-xs font-medium tracking-[0.25em] text-accent uppercase">
              {block.eyebrow}
            </p>
            <h2 className="font-display mt-4 text-2xl font-medium tracking-tight text-balance sm:text-3xl">
              {block.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{block.text}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {block.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 text-accent">✓</span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <CTAButton href={`/${locale}/ai`} variant="outline">
                {block.cta}
              </CTAButton>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 pb-20 sm:px-10 lg:pb-28">
        <SectionHeader title={home.faq.title} subtitle={home.faq.subtitle} align="center" />
        <FAQ items={dict.faq.items} />
      </section>

      {/* Contact CTA band */}
      <section className="bg-brown text-background">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center sm:px-10 lg:py-24">
          <h2 className="font-display mx-auto max-w-2xl text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {home.contact.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-background/70">{home.contact.text}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CTAButton href={`/${locale}/ai`} variant="light">
              {home.contact.cta}
            </CTAButton>
            <CTAButton
              href={`/${locale}/contacts`}
              variant="outline"
              className="border-background/30 text-background hover:border-background hover:text-background"
            >
              {dict.common.cta.contactUs}
            </CTAButton>
          </div>
        </div>
      </section>
    </main>
  );
}
