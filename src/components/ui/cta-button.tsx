import Link from "next/link";

type Variant = "primary" | "outline" | "light" | "gold";

const VARIANTS: Record<Variant, string> = {
  primary: "btn-gold hover:-translate-y-0.5",
  outline:
    "border border-border text-foreground hover:border-accent hover:text-accent hover:-translate-y-0.5",
  light:
    "bg-surface text-foreground border border-border shadow-[0_12px_30px_-16px_rgba(0,0,0,0.6)] hover:border-accent/50 hover:-translate-y-0.5",
  gold: "btn-gold hover:-translate-y-0.5",
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition duration-300 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
