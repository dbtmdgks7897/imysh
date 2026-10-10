import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LOCALES, assertLocale, type Locale } from "@/lib/locales";
import {
  listChildProjects,
  listProjectSlugPaths,
  loadProject,
  loadProjectMeta,
  projectHref,
} from "@/lib/content/projects";
import { loadPath, loadPathText } from "@/lib/content/profile";
import { findNodeIndexForProject, flattenPath, projectSequence } from "@/lib/content/path-index";
import { toSections } from "@/lib/content/sections";
import ProjectHero, { type BackLink } from "@/components/projects/ProjectHero";
import ProjectInfoCard from "@/components/projects/ProjectInfoCard";
import MiniTimeline, { type TimelineItem } from "@/components/projects/MiniTimeline";
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

function navLink(locale: Locale, slug: string | undefined): NavLink | null {
  if (!slug) return null;
  const slugPath = slug.split("/");
  return { href: projectHref(locale, slugPath), title: loadProject(slugPath, locale).title };
}

function SectionHeading({ id, num, children }: { id: string; num: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 text-2xl font-bold md:text-[26px]">
      <span className="mr-2 text-[15px] text-accent-text">{num}</span>
      {children}
    </h2>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = assertLocale(rawLocale);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "detail" });

  const slugKey = slug.join("/");
  const project = loadProject(slug, locale);
  const sections = toSections(project.body, project.meta.sections);
  const children = listChildProjects(slug, locale);
  const parent = slug.length > 1 ? loadProject(slug.slice(0, -1), locale) : null;

  // Where this project sits on the path (spec §3: detail pages lead back to "this period of me").
  const path = loadPath();
  const pathText = loadPathText(locale);
  const flat = flattenPath(path);
  const nodeIndex = findNodeIndexForProject(flat, slugKey);
  const node = nodeIndex >= 0 ? flat[nodeIndex] : null;
  const nodeText = node ? pathText.nodes[node.id] : null;
  const rowHref = node ? `/${locale}#path-${node.id}` : null;

  const timeline: TimelineItem[] =
    nodeIndex >= 0
      ? flat.slice(Math.max(0, nodeIndex - 1), nodeIndex + 2).map((n) => ({
          id: n.id,
          label: pathText.nodes[n.id].label,
          doing: pathText.nodes[n.id].doing,
          href: `/${locale}#path-${n.id}`,
          current: n.id === node?.id,
        }))
      : [];

  const backLinks: BackLink[] = [];
  if (node && nodeText && rowHref) backLinks.push({ href: rowHref, label: t("backToPath", { label: nodeText.label }) });
  if (parent) backLinks.push({ href: projectHref(locale, parent.slugPath), label: `← ${parent.title}` });

  const sequence = projectSequence(path, listProjectSlugPaths(), (s) => loadProjectMeta(s).order ?? 99);
  const position = sequence.indexOf(slugKey);
  const prev = navLink(locale, sequence[position - 1]);
  const next = navLink(locale, sequence[position + 1]);

  const hasThought = Boolean(sections.thought || nodeText?.thought);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pt-2 pb-8 md:px-6">
      <ProjectHero project={project} backLinks={backLinks} />

      <div className="mt-10 flex flex-wrap items-start gap-10 md:mt-12 md:gap-12">
        <aside aria-label={t("info")} className="flex min-w-0 flex-[1_1_260px] flex-col gap-4">
          <ProjectInfoCard project={project} />
          {timeline.length > 0 && <MiniTimeline items={timeline} nextLine={nodeText?.next} />}
        </aside>

        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-14">
          {sections.why && (
            <section aria-labelledby="why">
              <SectionHeading id="why" num="01">{t("why")}</SectionHeading>
              <ProjectContent source={sections.why} />
            </section>
          )}

          {(sections.what || sections.tech || children.length > 0) && (
            <section aria-labelledby="what">
              <SectionHeading id="what" num="02">{t("what")}</SectionHeading>
              {sections.what && <ProjectContent source={sections.what} />}
              <SubProjectList projects={children} locale={locale} />
              {sections.tech && (
                <details className="group mt-6 rounded-[20px] bg-surface-sub px-6">
                  <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                    {t("tech")}
                    <span aria-hidden="true" className="text-accent-text transition-transform group-open:rotate-45">
                      ＋
                    </span>
                  </summary>
                  <div className="pb-5 text-text-soft">
                    <ProjectContent source={sections.tech} />
                  </div>
                </details>
              )}
            </section>
          )}

          {hasThought && (
            <section aria-labelledby="thought">
              <SectionHeading id="thought" num="03">{t("thought")}</SectionHeading>
              {nodeText && (
                <p className="mb-5 text-xl leading-relaxed font-bold md:text-2xl">
                  <span className="bg-[linear-gradient(transparent_62%,var(--color-accent-tint)_62%)]">
                    {nodeText.thought}
                  </span>
                </p>
              )}
              {sections.thought && <ProjectContent source={sections.thought} />}
            </section>
          )}

          {rowHref && nodeText && (
            <a
              href={rowHref}
              className="flex min-h-11 items-center self-start text-accent-text underline decoration-accent decoration-2 underline-offset-4 hover:text-text"
            >
              {t("backToRow", { label: nodeText.label })}
            </a>
          )}

          <ProjectNav prev={prev} next={next} />
        </div>
      </div>
    </div>
  );
}
