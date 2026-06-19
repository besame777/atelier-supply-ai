import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  locale,
  index,
}: {
  project: Project;
  locale: Locale;
  index: number;
}) {
  return (
    <Link
      href={`/${locale}/projects/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:border-accent hover:shadow-[0_14px_50px_-18px_rgba(58,36,23,0.28)]"
    >
      {/* Image-led card */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={project.image.src}
          alt={project.image.alt[locale]}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          {project.tags[locale].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-beige px-3 py-1 text-[11px] font-medium tracking-wide text-bronze uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-display mt-4 text-xl font-medium tracking-tight transition-colors group-hover:text-bronze">
          {project.title[locale]}
        </h3>
        <p className="mt-1.5 text-sm text-muted">
          {project.location[locale]} · {project.area} {locale === "ru" ? "м²" : "m²"}
        </p>
      </div>
      <span className="sr-only">{String(index + 1).padStart(2, "0")}</span>
    </Link>
  );
}
