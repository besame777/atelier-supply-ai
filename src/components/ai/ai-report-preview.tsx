"use client";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { AIReport, DesignGenerationResult } from "@/lib/types";
import type { PreliminaryEstimate } from "@/lib/ai/preliminary-estimate";
import { AIDesignPreview } from "./ai-design-preview";
import { AIRoomConcept } from "./ai-room-concept";
import { AIDesignAnalysis } from "./ai-design-analysis";
import { AIPreliminaryEstimate } from "./ai-preliminary-estimate";

export function AIReportPreview({
  report,
  dict,
  designPreviewDict,
  generation,
  roomConceptDict,
  statusDict,
  analysisDict,
  estimate,
  estimateDict,
  locale,
  regenerating = false,
  regenerateDisabled = false,
  regenerateHint,
  onRegenerate,
  preliminaryBadge,
  preliminaryNote,
  onContinue,
}: {
  report: AIReport;
  dict: Dictionary["ai"]["report"];
  designPreviewDict: Dictionary["ai"]["designPreview"];
  /** Room-concept generation (empty-room flow). When set, the premium result layout is shown. */
  generation?: DesignGenerationResult | null;
  roomConceptDict: Dictionary["ai"]["roomConcept"];
  statusDict: Dictionary["ai"]["generation"];
  analysisDict: Dictionary["ai"]["analysis"];
  /** Item-based estimate from the analysis; null → use the generic report budget. */
  estimate?: PreliminaryEstimate | null;
  estimateDict: Dictionary["ai"]["estimate"];
  locale: Locale;
  regenerating?: boolean;
  regenerateDisabled?: boolean;
  regenerateHint?: string;
  onRegenerate?: () => void;
  preliminaryBadge: string;
  preliminaryNote: string;
  onContinue: () => void;
}) {
  /* ----------------------- Room flow: one coherent result ----------------------- */
  // Order: visualization → short summary → what's visible → added/changed →
  // preliminary estimate → CTA. The concept card carries the single neutral
  // "preliminary AI visualization" badge and the short summary, so the rest of
  // the screen stays calm and free of repeated "preliminary" language.
  if (generation) {
    return (
      <div>
        {/* 1 + 2. Visualization / before-after + short concept summary */}
        <div className="mb-8">
          <AIRoomConcept
            generation={generation}
            dict={roomConceptDict}
            statusDict={statusDict}
            locale={locale}
            regenerating={regenerating}
          />
        </div>

        {/* 3 + 4. What is visible, and what was added / changed */}
        {generation.analysis && (
          <div className="mb-8">
            <AIDesignAnalysis analysis={generation.analysis} dict={analysisDict} locale={locale} />
          </div>
        )}

        {/* 5. Preliminary estimate (item-based). Disclaimer lives inside this block. */}
        {estimate ? (
          <AIPreliminaryEstimate
            estimate={estimate}
            dict={estimateDict}
            locale={locale}
            timeline={report.highlights[1]?.value}
          />
        ) : (
          <p className="mt-6 text-xs leading-relaxed text-muted">{preliminaryNote}</p>
        )}

        {/* 6. CTA area */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating || regenerateDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-colors hover:bg-brown disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden className={regenerating ? "animate-spin" : ""}>↻</span>
            {regenerating ? roomConceptDict.regenerating : roomConceptDict.regenerate}
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center justify-center rounded-full border border-foreground/25 px-7 py-3.5 text-sm font-medium transition-colors hover:border-accent hover:text-bronze"
          >
            {dict.cta}
          </button>
        </div>
        {regenerateDisabled && regenerateHint && (
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted">{regenerateHint}</p>
        )}
      </div>
    );
  }

  /* ----------------- Design-project flow: procurement report ----------------- */
  return (
    <div>
      {report.preview && (
        <div className="mb-8">
          <AIDesignPreview data={report.preview} dict={designPreviewDict} />
        </div>
      )}

      <span className="inline-flex items-center gap-2 rounded-full bg-beige px-4 py-1.5 text-xs font-medium tracking-wide text-brown uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {preliminaryBadge}
      </span>

      <h3 className="font-display mt-5 text-2xl font-medium tracking-tight sm:text-3xl">
        {report.kind === "estimate" ? dict.estimateTitle : dict.conceptTitle}
      </h3>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{report.summary}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {report.highlights.map((h) => (
          <div key={h.label} className="rounded-xl border border-border bg-surface-soft p-5">
            <dt className="text-xs tracking-wide text-muted uppercase">{h.label}</dt>
            <dd className="font-display mt-2 text-lg font-medium text-bronze">{h.value}</dd>
          </div>
        ))}
      </dl>

      {report.palette && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-medium tracking-wide text-muted uppercase">
            {dict.paletteLabel}
          </p>
          <div className="flex flex-wrap gap-4">
            {report.palette.map((c) => (
              <div key={c.hex} className="flex items-center gap-2.5">
                <span
                  className="h-9 w-9 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-sm text-muted">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {report.sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-border bg-surface-soft p-6">
            <h4 className="font-display text-lg font-medium tracking-tight">{section.title}</h4>
            <ul className="mt-3 space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-accent/30 bg-beige/50 p-6">
        <p className="text-xs font-medium tracking-wide text-brown uppercase">
          {dict.disclaimerTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">{preliminaryNote}</p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-8 w-full rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background transition-colors hover:bg-brown sm:w-auto"
      >
        {dict.cta}
      </button>
    </div>
  );
}
