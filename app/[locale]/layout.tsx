import type { Metadata } from "next";
// Fonts: site-specific subsets in app/fonts/ (npm run fonts), declared in app/fonts.css.
import "../fonts.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { LOCALES, assertLocale, type Locale } from "@/lib/locales";
import { assertContentValid } from "@/lib/content/validate";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  // Fails the static build on any content error (both locales, slugs, images, enums).
  assertContentValid();
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_NAME,
    description: t("siteDescription"),
  };
}

const localeFontClass: Record<Locale, string> = {
  ja: "font-ja",
  ko: "font-ko",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  setRequestLocale(locale);
  const messages = await getMessages();
  const fontClass = localeFontClass[locale];

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className={`flex min-h-screen flex-col ${fontClass}`}>
            <Navigation locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
