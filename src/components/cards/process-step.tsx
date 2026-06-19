export function ProcessStep({
  index,
  title,
  text,
  isLast = false,
}: {
  index: number;
  title: string;
  text: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-6 sm:gap-8">
      {/* Number + connector line */}
      <div className="flex flex-col items-center">
        <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-surface text-base font-medium text-bronze">
          {String(index + 1).padStart(2, "0")}
        </span>
        {!isLast && <span className="mt-2 w-px flex-1 bg-border" />}
      </div>
      <div className={isLast ? "pb-2" : "pb-12"}>
        <h3 className="font-display pt-2.5 text-xl font-medium tracking-tight">{title}</h3>
        <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted">{text}</p>
      </div>
    </div>
  );
}
