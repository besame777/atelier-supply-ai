import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { DesignGenerationResult } from "@/lib/types";

/**
 * Room concept visual for the empty-room flow.
 * - redesign mode  → original photo + AI visualization, side by side.
 * - from-parameters → a single AI visualization.
 *
 * The preview image is a preliminary visualization placeholder today; swapping
 * in real generation only changes the service layer, not this component.
 */
export function AIRoomConcept({
  generation,
  dict,
  statusDict,
  locale,
  regenerating,
}: {
  generation: DesignGenerationResult;
  dict: Dictionary["ai"]["roomConcept"];
  statusDict: Dictionary["ai"]["generation"];
  locale: Locale;
  regenerating: boolean;
}) {
  const isRedesign = generation.mode === "redesign" && Boolean(generation.originalImage);
  const modeLabel = generation.mode === "redesign" ? dict.redesignMode : dict.paramsMode;
  const conceptTitle = locale === "ru" ? generation.variationTitleRu : generation.variationTitleEn;
  // Generated images arrive as data:/https URLs; local mock images start with "/".
  const remotePreview = !generation.previewImage.startsWith("/");

  // Real generations need no extra chip — the image already carries the neutral
  // "preliminary visualization" badge. Only flag demo / fallback states, and we
  // never surface the provider name.
  const statusChip = !generation.isMock
    ? null
    : generation.fellBack
      ? { text: statusDict.fallbackNotice, tone: "border-accent/40 text-bronze" }
      : { text: statusDict.demoMode, tone: "border-border text-muted" };

  const meta = [
    { label: dict.styleLabel, value: generation.style },
    { label: dict.paletteLabel, value: generation.palette },
    { label: dict.areaLabel, value: generation.area },
    { label: dict.roomLabel, value: generation.roomType },
  ];

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface-soft">
      <div className={isRedesign ? "grid gap-px bg-border sm:grid-cols-2" : ""}>
        {isRedesign && (
          <div className="relative aspect-[4/3] bg-charcoal">
            {/* Uploaded photo is a blob: URL — use a plain img (next/image can't optimize blobs). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generation.originalImage}
              alt={dict.originalTitle}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-charcoal/0" />
            <span className="absolute bottom-3 left-3 rounded-full bg-charcoal/55 px-3 py-1 text-[11px] font-medium tracking-wide text-on-dark uppercase backdrop-blur">
              {dict.originalTitle}
            </span>
          </div>
        )}

        <div className="relative aspect-[4/3] sm:aspect-auto">
          <div className={`relative ${isRedesign ? "h-full min-h-[16rem]" : "aspect-[16/10] sm:aspect-[16/9]"}`}>
            <Image
              src={generation.previewImage}
              alt={dict.visualizationTitle}
              fill
              unoptimized={remotePreview}
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
            {/* Darken only the lower band for caption legibility; keep the image bright. */}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent" />

            <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-charcoal/55 px-3 py-1.5 text-[11px] font-medium tracking-wide text-on-dark uppercase backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" />
              {dict.badge}
            </span>

            <figcaption className="absolute right-3 bottom-3 left-3">
              <p className="font-display text-lg font-medium tracking-tight text-on-dark sm:text-xl">
                {dict.visualizationTitle}
              </p>
            </figcaption>

            {regenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-charcoal/55 backdrop-blur-sm">
                <span className="h-9 w-9 animate-spin rounded-full border-2 border-on-dark/40 border-t-on-dark" />
                <span className="text-xs font-medium tracking-wide text-on-dark">{dict.regenerating}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Premium concept label — the chosen design direction. */}
        {conceptTitle && (
          <p className="mb-3 text-[11px] font-medium tracking-wide text-bronze uppercase">
            {dict.conceptLabel}: {conceptTitle}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          {/* Quiet status label — describes the mode, not an action. */}
          <span className="text-[11px] tracking-wide text-muted uppercase">{modeLabel}</span>
          <span aria-hidden className="text-muted/40">·</span>
          <span className="text-[11px] tracking-wide text-muted uppercase">
            {dict.variantLabel} {generation.variant + 1}
          </span>
          {statusChip && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${statusChip.tone}`}
            >
              {statusChip.text}
            </span>
          )}
          <span className="ml-auto flex gap-1.5" aria-hidden>
            {generation.swatches.map((hex) => (
              <span
                key={hex}
                className="h-5 w-5 rounded-full border border-border/70"
                style={{ backgroundColor: hex }}
              />
            ))}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-border py-4 lg:grid-cols-4">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="text-[11px] tracking-wide text-muted uppercase">{m.label}</dt>
              <dd className="font-display mt-1 text-sm font-medium text-bronze sm:text-base">{m.value}</dd>
            </div>
          ))}
        </dl>

        {/* Short concept summary */}
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">{generation.promptSummary}</p>
      </div>
    </figure>
  );
}
