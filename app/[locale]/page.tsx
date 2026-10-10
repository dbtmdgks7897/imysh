import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HeroSection from "@/components/home/HeroSection";
import ProjectsSection from "@/components/home/ProjectsSection";
import { assertLocale } from "@/lib/locales";
import { listTopLevelProjects } from "@/lib/content/projects";
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
  const projects = listTopLevelProjects(locale);
  return (
    <div className="mx-auto max-w-[960px] px-6">
      <HeroSection />
      <ProjectsSection locale={locale} projects={projects} />
    </div>
  );
}
