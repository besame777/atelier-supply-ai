export function ProgressSteps({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                done
                  ? "bg-accent text-charcoal"
                  : active
                    ? "btn-gold"
                    : "border border-border bg-surface text-muted"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={`hidden text-xs sm:block ${
                active ? "font-medium text-foreground" : "text-muted"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={`h-px flex-1 ${done ? "bg-accent" : "bg-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
