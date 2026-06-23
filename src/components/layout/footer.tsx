import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const MAIN_SITE = "https://ateliersupply.ru";

export function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary["common"];
}) {
  const backToMain = locale === "ru" ? "На основной сайт" : "Back to main site";
  const privacyLabel =
    locale === "ru" ? "Политика конфиденциальности" : "Privacy policy";

  return (
    <footer className="border-t border-border bg-charcoal text-on-dark">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex items-center gap-2.5">
          <span className="font-sans text-sm font-extrabold uppercase tracking-[0.2em]">
            {dict.brand}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Concept
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-on-dark/70">
          <a href={MAIN_SITE} className="transition-colors hover:text-accent">
            {backToMain}
          </a>
          <a
            href={`${MAIN_SITE}/privacy.html`}
            className="transition-colors hover:text-accent"
          >
            {privacyLabel}
          </a>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-1.5 px-6 py-5 text-xs text-on-dark/40 sm:px-10">
          <p>
            © {new Date().getFullYear()} {dict.brand}. {dict.footer.rights}
          </p>
          <p className="max-w-2xl">{dict.preliminaryNote}</p>
        </div>
      </div>
    </footer>
  );
}
