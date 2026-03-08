import type { Metadata } from "next";
import { Inter, Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--next-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--next-noto-jp",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--next-jetbrains-mono",
  display: "swap",
});

const LOCALES = ["ko", "ja", "en"] as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata(): Metadata {
  return {
    title: "imysh",
    description: "Personal portfolio — Projects, craft, and values.",
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}/`])),
    },
  };
}

const localeFontClass: Record<string, string> = {
  ko: "font-pretendard",
  ja: "font-noto-sans-jp",
  en: "font-inter",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const fontClass = localeFontClass[locale] ?? "font-inter";

  return (
    <html lang={locale}>
      <head>
        {/* Pretendard Variable — CDN (KO 폰트) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansJP.variable} ${jetbrainsMono.variable}`}
      >
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
