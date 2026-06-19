import Image from "next/image";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { DesignPreviewData } from "@/lib/types";

/**
 * Visual preview shown at the top of an AI report.
 * - `design`: large empty-room "AI room concept" image (the wow feature).
 * - `procurement`: smaller design-project "procurement analysis" block.
 *
 * The image is a preliminary visualization placeholder today; it will be
 * swapped for a generated image without changing this component (see
 * `src/lib/ai/design-preview.ts`).
 */
export function AIDesignPreview({
  data,
  dict,
}: {
  data: DesignPreviewData;
  dict: Dictionary["ai"]["designPreview"];
}) {
  const isDesign = data.variant === "design";
  const title = isDesign ? dict.conceptTitle : dict.procurementTitle;

  const meta = isDesign
    ? [
        { label: dict.styleLabel, value: data.style },
        { label: dict.roomLabel, value: data.roomType },
        { label: dict.areaLabel, value: data.area },
      ].filter((m): m is { label: string; value: string } => Boolean(m.value))
    : [];

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface-soft">
      <div className={`relative ${isDesign ? "aspect-[16/10] sm:aspect-[16/9]" : "aspect-[21/9]"}`}>
        <Image
          src={data.image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover"
        />
        {/* Warm scrim for label legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-charcoal/15"
        />

        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-charcoal/55 px-3 py-1.5 text-[11px] font-medium tracking-wide text-on-dark uppercase backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
          {dict.badge}
        </span>

        <figcaption className="absolute right-4 bottom-4 left-4">
          <p className="font-display text-xl font-medium tracking-tight text-on-dark sm:text-2xl">
            {title}
          </p>
        </figcaption>
      </div>

      <div className="p-5 sm:p-6">
        {meta.length > 0 && (
          <dl className="grid grid-cols-3 gap-4 border-b border-border pb-5">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="text-[11px] tracking-wide text-muted uppercase">{m.label}</dt>
                <dd className="font-display mt-1 text-base font-medium text-bronze sm:text-lg">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <p className={`text-xs leading-relaxed text-muted ${meta.length > 0 ? "mt-4" : ""}`}>
          {isDesign ? dict.note : dict.procurementNote}
        </p>
      </div>
    </figure>
  );
}
