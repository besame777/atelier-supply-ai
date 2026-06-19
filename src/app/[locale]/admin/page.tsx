import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { AdminShell } from "@/components/admin-shell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));
  return { title: dict.adminPage.meta.title };
}

export default async function AdminPage({ params }: Props) {
  const { locale: raw } = await params;
  const dict = await getDictionary(toLocale(raw));

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-20">
      <AdminShell dict={dict.adminPage} />
    </main>
  );
}
