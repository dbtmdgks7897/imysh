import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LOCALES, assertLocale } from "@/lib/locales";
import {
  listChildProjects,
  listProjectSlugPaths,
  listTopLevelProjects,
  loadProject,
  projectHref,
  type Project,
} from "@/lib/content/projects";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectContent from "@/components/projects/ProjectContent";
import SubProjectList from "@/components/projects/SubProjectList";
import ProjectNav, { type NavLink } from "@/components/projects/ProjectNav";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  const slugs = listProjectSlugPaths();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  const project = loadProject(slug, locale);
  return pageMetadata({
    locale,
    subpath: `/projects/${slug.join("/")}`,
    title: `${project.title} | ${SITE_NAME}`,
    description: project.summary,
    type: "article",
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  setRequestLocale(locale);

  const project = loadProject(slug, locale);
  const children = listChildProjects(slug, locale);
  const parent = slug.length > 1 ? loadProject(slug.slice(0, -1), locale) : null;

  // Prev/next only between top-level projects, in meta.yaml `order`.
  const siblings = slug.length === 1 ? listTopLevelProjects(locale) : [];
  const index = siblings.findIndex((p) => p.slugPath[0] === slug[0]);
  const toLink = (p: Project | undefined): NavLink | null =>
    p ? { href: projectHref(locale, p.slugPath), title: p.title } : null;

  return (
    <div className="mx-auto max-w-[960px] px-6 py-12">
      <ProjectHeader project={project} locale={locale} parentTitle={parent?.title} />
      <div className="mt-8">
        <ProjectContent source={project.body} />
      </div>
      {children.length > 0 && <SubProjectList projects={children} locale={locale} />}
      <ProjectNav
        slugPath={slug}
        locale={locale}
        prev={index > 0 ? toLink(siblings[index - 1]) : null}
        next={index >= 0 ? toLink(siblings[index + 1]) : null}
      />
    </div>
  );
}
