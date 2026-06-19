export function ServiceCard({
  index,
  title,
  text,
}: {
  index: number;
  title: string;
  text: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-8 transition-all hover:border-accent hover:shadow-[0_8px_40px_-12px_rgba(76,58,42,0.15)]">
      <span className="font-display text-sm font-medium text-accent">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="font-display mt-4 text-xl font-medium tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}
