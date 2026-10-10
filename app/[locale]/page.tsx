import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NowSection from "@/components/home/NowSection";
import PathTable from "@/components/home/PathTable";
import { assertLocale } from "@/lib/locales";
import { listProjectSlugPaths, loadProject } from "@/lib/content/projects";
import { loadNow, loadNowText, loadPath, loadPathText } from "@/lib/content/profile";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, subpath: "", title: SITE_NAME, description: t("siteDescription") });
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = assertLocale(rawLocale);
  setRequestLocale(locale);

  const projectTitles = Object.fromEntries(
    listProjectSlugPaths().map((s) => [s.join("/"), loadProject(s, locale).title]),
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
      <NowSection locale={locale} now={loadNow()} text={loadNowText(locale)} />
      <PathTable locale={locale} path={loadPath()} text={loadPathText(locale)} projectTitles={projectTitles} />
    </div>
  );
}
