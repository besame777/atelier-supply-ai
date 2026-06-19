import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ContactForm } from "@/components/contact-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.contactsPage.meta.title };
}

export default async function ContactsPage({ params }: Props) {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  const t = dict.contactsPage;

  const channels = [
    { label: t.labels.email, value: t.channels.email },
    { label: t.labels.phone, value: t.channels.phone },
    { label: t.labels.telegram, value: t.channels.telegram },
    { label: t.labels.whatsapp, value: t.channels.whatsapp },
    { label: t.labels.hours, value: t.channels.hours },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
      <div className="mb-14 max-w-2xl">
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-5 text-muted sm:text-lg">{t.subtitle}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <aside className="h-fit rounded-2xl border border-border bg-surface p-8 sm:p-10">
          <h2 className="font-display text-2xl font-medium">{t.channelsTitle}</h2>
          <dl className="mt-6 space-y-5">
            {channels.map((c) => (
              <div key={c.label}>
                <dt className="text-xs tracking-wide text-muted uppercase">{c.label}</dt>
                <dd className="mt-1 font-medium">{c.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-xs text-muted/80">{t.note}</p>
        </aside>

        <ContactForm dict={t.form} />
      </div>
    </main>
  );
}
