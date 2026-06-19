import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { AnalysisItem, DesignAnalysis } from "@/lib/types";

/**
 * Renders what is actually visible in the generated design, from the server-side
 * vision analysis — furniture / lighting / decor with counts, materials, a layout
 * summary, and (in redesign mode) what was added / changed. No hardcoded generic
 * line-ups: everything here comes from `analysis`.
 */
export function AIDesignAnalysis({
  analysis,
  dict,
  locale,
}: {
  analysis: DesignAnalysis;
  dict: Dictionary["ai"]["analysis"];
  locale: Locale;
}) {
  const itemName = (it: AnalysisItem) =>
    locale === "ru" ? it.name_ru || it.name_en : it.name_en || it.name_ru;

  const groups = [
    { label: dict.furniture, items: analysis.furniture },
    { label: dict.lighting, items: analysis.lighting },
    { label: dict.decor, items: analysis.decor },
  ].filter((g) => g.items.length > 0);

  const materials = analysis.materials
    .map((m) => (locale === "ru" ? m.ru || m.en : m.en || m.ru))
    .filter(Boolean);
  const layout = locale === "ru" ? analysis.layoutSummaryRu : analysis.layoutSummaryEn;
  const notes = locale === "ru" ? analysis.notesRu : analysis.notesEn;
  const added = (locale === "ru" ? analysis.addedRu : analysis.addedEn) ?? [];
  const changed = (locale === "ru" ? analysis.changedRu : analysis.changedEn) ?? [];

  if (groups.length === 0 && materials.length === 0 && !layout) return null;

  return (
    <section className="rounded-2xl border border-border bg-surface-soft p-5 sm:p-7">
      <h3 className="font-display text-lg font-medium tracking-tight sm:text-xl">{dict.title}</h3>
      {layout && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{layout}</p>}

      {groups.length > 0 && (
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="text-[11px] font-medium tracking-wide text-muted uppercase">{g.label}</p>
              <ul className="mt-2.5 space-y-1.5">
                {g.items.map((it, i) => (
                  <li
                    key={`${it.name_en}-${i}`}
                    className="flex items-center justify-between gap-3 text-sm text-foreground/80"
                  >
                    <span>{itemName(it)}</span>
                    <span className="shrink-0 rounded-full bg-beige px-2 py-0.5 text-[11px] font-medium text-brown">
                      ×{it.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {materials.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">{dict.materials}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {materials.map((m, i) => (
              <span
                key={`${m}-${i}`}
                className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {(added.length > 0 || changed.length > 0) && (
        <div className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
          {added.length > 0 && (
            <div>
              <p className="text-[11px] font-medium tracking-wide text-bronze uppercase">{dict.added}</p>
              <ul className="mt-2.5 space-y-1.5">
                {added.map((a, i) => (
                  <li key={`a-${i}`} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {changed.length > 0 && (
            <div>
              <p className="text-[11px] font-medium tracking-wide text-bronze uppercase">{dict.changed}</p>
              <ul className="mt-2.5 space-y-1.5">
                {changed.map((c, i) => (
                  <li key={`c-${i}`} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {notes.length > 0 && (
        <p className="mt-5 text-xs leading-relaxed text-muted">{notes.join(" · ")}</p>
      )}
    </section>
  );
}
