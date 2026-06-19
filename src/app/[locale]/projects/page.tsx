import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { projects } from "@/lib/data/projects";
import { ProjectCard } from "@/components/cards/project-card";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.projectsPage.meta.title };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
      <div className="mb-14 max-w-2xl">
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {dict.projectsPage.title}
        </h1>
        <p className="mt-5 text-muted sm:text-lg">{dict.projectsPage.subtitle}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} locale={locale} index={i} />
        ))}
      </div>
    </main>
  );
}
