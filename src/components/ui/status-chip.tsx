const TONES: Record<string, string> = {
  new: "bg-beige text-brown",
  active: "bg-accent/15 text-brown",
  done: "bg-charcoal/10 text-charcoal",
};

export function StatusChip({
  tone,
  children,
}: {
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${TONES[tone] ?? TONES.new}`}
    >
      {children}
    </span>
  );
}
