import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProject, projects } from "@/lib/data/projects";
import { CTAButton } from "@/components/ui/cta-button";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title[toLocale(raw)] };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = toLocale(raw);
  const dict = await getDictionary(locale);
  const t = dict.projectsPage;

  const project = getProject(slug);
  if (!project) notFound();

  const meta = [
    { label: t.location, value: project.location[locale] },
    { label: t.area, value: `${project.area} ${locale === "ru" ? "м²" : "m²"}` },
    { label: t.budget, value: project.budget },
    { label: t.duration, value: project.duration[locale] },
  ];

  return (
    <main>
      {/* Title block */}
      <section className="mx-auto max-w-7xl px-6 pt-12 sm:px-10 lg:pt-16">
        <Link
          href={`/${locale}/projects`}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← {t.back}
        </Link>
        <div className="mt-8 flex flex-wrap gap-2">
          {project.tags[locale].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-beige px-3 py-1 text-[11px] font-medium tracking-wide text-bronze uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="font-display mt-5 max-w-3xl text-4xl font-medium tracking-tight text-balance sm:text-6xl">
          {project.title[locale]}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {project.summary[locale]}
        </p>
      </section>

      {/* Project imagery */}
      <section className="mx-auto max-w-7xl px-6 pt-12 sm:px-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] sm:aspect-[21/9]">
          <Image
            src={project.image.src}
            alt={project.image.alt[locale]}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="object-cover"
          />
        </div>
      </section>

      {/* Meta strip */}
      <section className="mx-auto max-w-7xl px-6 sm:px-10">
        <dl className="mt-12 grid grid-cols-2 gap-8 border-y border-border py-10 lg:grid-cols-4">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="text-xs tracking-wide text-muted uppercase">{m.label}</dt>
              <dd className="font-display mt-2 text-lg font-medium text-bronze">{m.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Description + scope */}
      <section className="mx-auto grid max-w-7xl gap-14 px-6 py-16 sm:px-10 lg:grid-cols-[1.6fr_1fr] lg:py-20">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {t.aboutTitle}
          </h2>
          <div className="mt-6 space-y-5">
            {project.description[locale].map((p) => (
              <p key={p} className="leading-relaxed text-foreground/80">
                {p}
              </p>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-surface p-8">
          <h2 className="font-display text-xl font-medium">{t.scopeTitle}</h2>
          <ul className="mt-5 space-y-3">
            {project.scope[locale].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-1 text-accent">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* CTA */}
      <section className="bg-beige/50">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-10">
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {t.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{t.ctaText}</p>
          <div className="mt-8">
            <CTAButton href={`/${locale}/ai`}>{t.cta}</CTAButton>
          </div>
        </div>
      </section>
    </main>
  );
}
