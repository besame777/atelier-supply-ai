import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { StatusChip } from "@/components/ui/status-chip";

export function DashboardShell({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["dashboardPage"];
}) {
  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {dict.title}
          </h1>
          <p className="mt-3 text-muted">{dict.subtitle}</p>
        </div>
        <Link
          href={`/${locale}/ai`}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-brown"
        >
          {dict.newEstimate}
        </Link>
      </div>

      {/* My projects */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-medium">{dict.projectsTitle}</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
                <th className="px-6 py-4 font-medium">{dict.table.project}</th>
                <th className="px-6 py-4 font-medium">{dict.table.status}</th>
                <th className="px-6 py-4 font-medium">{dict.table.updated}</th>
              </tr>
            </thead>
            <tbody>
              {dict.projects.map((p) => (
                <tr key={p.name} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4">
                    <StatusChip tone={p.tone}>{p.status}</StatusChip>
                  </td>
                  <td className="px-6 py-4 text-muted">{p.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Latest AI reports */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-medium">{dict.reportsTitle}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {dict.reports.map((r) => (
            <div
              key={r.title}
              className="flex flex-col rounded-2xl border border-border bg-surface p-6"
            >
              <span className="text-xs tracking-wide text-accent uppercase">{r.type}</span>
              <p className="mt-2 font-medium">{r.title}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">{r.date}</span>
                <Link
                  href={`/${locale}/ai`}
                  className="text-sm font-medium text-bronze hover:text-accent"
                >
                  {dict.openReport} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-xs text-muted/80">{dict.note}</p>
    </div>
  );
}
