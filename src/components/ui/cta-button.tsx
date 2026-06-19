import Link from "next/link";

type Variant = "primary" | "outline" | "light" | "gold";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-foreground text-background shadow-[0_12px_30px_-14px_rgba(58,36,23,0.55)] hover:bg-brown hover:shadow-[0_18px_40px_-14px_rgba(58,36,23,0.65)] hover:-translate-y-0.5",
  outline:
    "border border-foreground/25 text-foreground hover:border-accent hover:text-bronze hover:-translate-y-0.5",
  light:
    "bg-background text-foreground shadow-[0_12px_30px_-16px_rgba(0,0,0,0.5)] hover:bg-beige hover:-translate-y-0.5",
  gold:
    "bg-accent text-background shadow-[0_12px_30px_-14px_rgba(176,138,90,0.6)] hover:bg-brown hover:-translate-y-0.5",
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
