import Image from "next/image";
import Link from "next/link";

/**
 * Large scenario card, optionally image-led. Renders as a link when `href`
 * is given, or as a button when `onSelect` is given (inside the AI wizard).
 */
export function ScenarioCard({
  title,
  text,
  ctaLabel,
  bullets,
  href,
  onSelect,
  image,
}: {
  title: string;
  text: string;
  ctaLabel: string;
  bullets?: string[];
  href?: string;
  onSelect?: () => void;
  image?: { src: string; alt: string };
}) {
  const inner = (
    <>
      {image && (
        <div className="relative mb-7 aspect-[16/9] w-full overflow-hidden rounded-xl">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <h3 className="font-display text-2xl font-medium tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
      {bullets && (
        <ul className="mt-5 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/80">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
              {b}
            </li>
          ))}
        </ul>
      )}
      <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-bronze">
        {ctaLabel}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </>
  );

  const className =
    "group flex h-full w-full flex-col items-start rounded-2xl border border-border bg-surface p-7 text-left transition-all duration-300 hover:border-accent hover:shadow-[0_14px_50px_-18px_rgba(58,36,23,0.28)] sm:p-9";

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onSelect} className={className}>
      {inner}
    </button>
  );
}
