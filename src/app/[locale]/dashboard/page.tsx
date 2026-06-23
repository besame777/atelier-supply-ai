import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { DashboardShell } from "@/components/dashboard-shell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return {
    title: dict.dashboardPage.meta.title,
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = toLocale(raw);
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:py-20">
      <DashboardShell locale={locale} dict={dict.dashboardPage} />
    </main>
  );
}
