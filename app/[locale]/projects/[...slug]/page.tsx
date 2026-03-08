import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  getAllProjectSlugs,
  getProjectContent,
  getSubProjects,
} from "@/lib/markdown";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectContent from "@/components/projects/ProjectContent";
import SubProjectList from "@/components/projects/SubProjectList";
import ProjectNav from "@/components/projects/ProjectNav";

const LOCALES = ["ko", "ja", "en"];

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return LOCALES.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const content = await getProjectContent(slug, locale);
  if (!content) notFound();

  const subProjects = await getSubProjects(slug, locale);

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12">
      <ProjectHeader
        frontmatter={content.frontmatter}
        slugPath={slug}
        locale={locale}
      />
      <div className="mt-8">
        <ProjectContent source={content.source} />
      </div>
      {subProjects.length > 0 && (
        <SubProjectList subProjects={subProjects} locale={locale} />
      )}
      <ProjectNav slugPath={slug} locale={locale} />
    </div>
  );
}
