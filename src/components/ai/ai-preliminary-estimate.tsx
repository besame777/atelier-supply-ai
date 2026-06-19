import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import {
  formatUsdRange,
  type EstimateGroupKey,
  type PreliminaryEstimate,
} from "@/lib/ai/preliminary-estimate";

/**
 * Item-based preliminary estimate breakdown, built from the vision analysis.
 * Grouped by furniture / lighting / decor; each line is "Name ×count — $low–$high".
 * Always framed as a preliminary estimate, never a final quote.
 */
export function AIPreliminaryEstimate({
  estimate,
  dict,
  locale,
  timeline,
}: {
  estimate: PreliminaryEstimate;
  dict: Dictionary["ai"]["estimate"];
  locale: Locale;
  /** Optional indicative timeline, shown muted next to the total. */
  timeline?: string;
}) {
  const groupLabel: Record<EstimateGroupKey, string> = {
    furniture: dict.furniture,
    lighting: dict.lighting,
    decor: dict.decor,
  };

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface-soft p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="font-display text-lg font-medium tracking-tight sm:text-xl">{dict.title}</h4>
        <div className="text-right">
          <p className="font-display text-xl font-medium text-bronze">
            {formatUsdRange(estimate.estimateLow, estimate.estimateHigh)}
          </p>
          {timeline && <p className="mt-0.5 text-[11px] tracking-wide text-muted">{timeline}</p>}
        </div>
      </div>

      <p className="mt-4 text-[11px] font-medium tracking-wide text-muted uppercase">
        {dict.specification}
      </p>

      <div className="mt-2.5 space-y-5">
        {estimate.groups.map((g) => (
          <div key={g.key}>
            <div className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5">
              <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
                {groupLabel[g.key]}
              </span>
              <span className="text-[11px] tracking-wide text-muted">
                {formatUsdRange(g.low, g.high)}
              </span>
            </div>
            <ul className="mt-1.5 divide-y divide-border/50">
              {g.items.map((it, i) => {
                const name =
                  (locale === "ru" ? it.name_ru : it.name_en) ||
                  (locale === "ru" ? it.name_en : it.name_ru);
                return (
                  <li
                    key={`${it.name_en}-${i}`}
                    className="flex items-center justify-between gap-3 py-1.5 text-sm"
                  >
                    <span className="text-foreground/80">
                      {name} <span className="text-muted">×{it.count}</span>
                    </span>
                    <span className="shrink-0 text-foreground/70">
                      {formatUsdRange(it.low, it.high)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted">{dict.disclaimer}</p>
    </section>
  );
}
