import { redirect } from "next/navigation";

type Props = { params: Promise<{ locale: string }> };

// Legacy route: the AI tool now lives at the locale index (/app, /app/en).
// Redirect any old /{locale}/ai links to the clean URL. (Middleware also
// intercepts this; the page-level redirect is a safety net.)
export default async function LegacyAIPage({ params }: Props) {
  const { locale } = await params;
  redirect(locale === "en" ? "/en" : "/");
}
