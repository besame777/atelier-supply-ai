"use client";

import { ProgressSteps } from "./progress-steps";

export function WizardShell({
  steps,
  current,
  onBack,
  backLabel,
  children,
}: {
  steps: string[];
  current: number;
  onBack?: () => void;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10">
      <ProgressSteps steps={steps} current={current} />
      <div className="mt-8 sm:mt-10">{children}</div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span> {backLabel}
        </button>
      )}
    </div>
  );
}
