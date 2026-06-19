import type { Dictionary } from "@/i18n/get-dictionary";
import { StatusChip } from "@/components/ui/status-chip";

export function AdminShell({ dict }: { dict: Dictionary["adminPage"] }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
        {dict.title}
      </h1>
      <p className="mt-3 text-muted">{dict.subtitle}</p>

      {/* Stats */}
      <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {dict.stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-6">
            <dd className="font-display text-3xl font-medium text-brown">{s.value}</dd>
            <dt className="mt-2 text-sm text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      {/* Leads */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-medium">{dict.leadsTitle}</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
                <th className="px-6 py-4 font-medium">{dict.leadsTable.name}</th>
                <th className="px-6 py-4 font-medium">{dict.leadsTable.contact}</th>
                <th className="px-6 py-4 font-medium">{dict.leadsTable.scenario}</th>
                <th className="px-6 py-4 font-medium">{dict.leadsTable.date}</th>
                <th className="px-6 py-4 font-medium">{dict.leadsTable.status}</th>
              </tr>
            </thead>
            <tbody>
              {dict.leads.map((lead) => (
                <tr key={lead.name} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4 font-medium">{lead.name}</td>
                  <td className="px-6 py-4 text-muted">{lead.contact}</td>
                  <td className="px-6 py-4">{lead.scenario}</td>
                  <td className="px-6 py-4 text-muted">{lead.date}</td>
                  <td className="px-6 py-4">
                    <StatusChip tone={lead.tone}>{lead.status}</StatusChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Projects */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-medium">{dict.projectsTitle}</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
                <th className="px-6 py-4 font-medium">{dict.projectsTable.project}</th>
                <th className="px-6 py-4 font-medium">{dict.projectsTable.client}</th>
                <th className="px-6 py-4 font-medium">{dict.projectsTable.stage}</th>
                <th className="px-6 py-4 font-medium">{dict.projectsTable.status}</th>
              </tr>
            </thead>
            <tbody>
              {dict.projects.map((p) => (
                <tr key={p.project} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-4 font-medium">{p.project}</td>
                  <td className="px-6 py-4 text-muted">{p.client}</td>
                  <td className="px-6 py-4">{p.stage}</td>
                  <td className="px-6 py-4">
                    <StatusChip tone={p.tone}>{p.status}</StatusChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-10 text-xs text-muted/80">{dict.note}</p>
    </div>
  );
}
