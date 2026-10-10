import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
// Noto Sans JP is self-hosted from npm instead of next/font/google: Google sometimes serves
// CJK fonts as /l/font?kit=...&skey=... URLs, which next/font/google cannot resolve
// (seen on GitHub Actions runners; build fails with "queries have exactly one entry").
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/700.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { LOCALES, assertLocale, type Locale } from "@/lib/locales";
import { assertContentValid } from "@/lib/content/validate";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "../globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--next-jetbrains-mono",
  display: "swap",
});

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
  ja: "font-noto-sans-jp",
  ko: "font-pretendard",
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
      <head>
        {/* Pretendard Variable — CDN (KO 폰트) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body className={jetbrainsMono.variable}>
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
