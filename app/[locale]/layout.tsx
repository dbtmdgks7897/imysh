import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

export function generateStaticParams() {
  return [{ locale: "ko" }, { locale: "ja" }, { locale: "en" }];
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
  const fontClass = localeFontClass[locale] ?? "font-inter";

  return (
    <div className={`flex min-h-screen flex-col ${fontClass}`}>
      <Navigation locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
