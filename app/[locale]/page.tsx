import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import NowSection from "@/components/home/NowSection";
import PathTable from "@/components/home/PathTable";
import HubThread from "@/components/home/HubThread";
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

  const projects = listProjectSlugPaths().map((s) => loadProject(s, locale));
  const projectTitles = Object.fromEntries(projects.map((p) => [p.slugPath.join("/"), p.title]));
  const projectThumbnails = Object.fromEntries(projects.map((p) => [p.slugPath.join("/"), p.meta.thumbnail]));

  return (
    // isolate: the thread's svg sits behind the content (z-index -1) but above the page ground
    <div className="relative isolate mx-auto w-full max-w-[1280px] px-4 md:px-8">
      <HubThread />
      <NowSection locale={locale} now={loadNow()} text={loadNowText(locale)} />
      <PathTable locale={locale} path={loadPath()} text={loadPathText(locale)} projectTitles={projectTitles} projectThumbnails={projectThumbnails} />
    </div>
  );
}
