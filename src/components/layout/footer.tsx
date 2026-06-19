import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Footer({
  locale,
  dict,
  contacts,
}: {
  locale: Locale;
  dict: Dictionary["common"];
  contacts: Dictionary["contactsPage"]["channels"];
}) {
  const nav = [
    { label: dict.nav.home, path: "" },
    { label: dict.nav.ai, path: "/ai" },
    { label: dict.nav.projects, path: "/projects" },
    { label: dict.nav.services, path: "/services" },
    { label: dict.nav.process, path: "/process" },
  ];
  const company = [
    { label: dict.nav.about, path: "/about" },
    { label: dict.nav.contacts, path: "/contacts" },
    { label: dict.nav.dashboard, path: "/dashboard" },
  ];

  return (
    <footer className="bg-charcoal text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold">{dict.brand}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/60">
            {dict.footer.description}
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-accent-soft uppercase">
            {dict.footer.navigation}
          </p>
          <ul className="space-y-2.5">
            {nav.map((item) => (
              <li key={item.path}>
                <Link
                  href={`/${locale}${item.path}`}
                  className="text-sm text-background/70 transition-colors hover:text-background"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-accent-soft uppercase">
            {dict.footer.company}
          </p>
          <ul className="space-y-2.5">
            {company.map((item) => (
              <li key={item.path}>
                <Link
                  href={`/${locale}${item.path}`}
                  className="text-sm text-background/70 transition-colors hover:text-background"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-accent-soft uppercase">
            {dict.footer.contacts}
          </p>
          <ul className="space-y-2.5 text-sm text-background/70">
            <li>{contacts.email}</li>
            <li>{contacts.phone}</li>
            <li>{contacts.telegram}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-background/40 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>
            © {new Date().getFullYear()} {dict.brand}. {dict.footer.rights}
          </p>
          <p className="max-w-xl">{dict.preliminaryNote}</p>
        </div>
      </div>
    </footer>
  );
}
