import { useTranslations } from "next-intl";
import { ProjectFrontmatter } from "@/lib/markdown";
import { ProjectStatus } from "@/lib/projects";
import ProjectCard from "@/components/projects/ProjectCard";

type SubProject = ProjectFrontmatter & { slug: string[] };

interface SubProjectListProps {
  subProjects: SubProject[];
  locale: string;
}

export default function SubProjectList({
  subProjects,
  locale,
}: SubProjectListProps) {
  const t = useTranslations("subProjectList");
  if (subProjects.length === 0) return null;

  // ProjectCard가 기대하는 Project 타입으로 변환
  const cards = subProjects.map((sp) => ({
    slug: sp.slug[sp.slug.length - 1],
    title: sp.title,
    summary: sp.summary,
    stack: sp.stack,
    status: sp.status as ProjectStatus,
    period: sp.period,
    thumbnail: sp.thumbnail,
    githubUrl: sp.githubUrl,
    liveUrl: sp.liveUrl,
    // 상세 페이지 링크는 전체 slug 경로 사용
    _fullSlug: sp.slug.join("/"),
  }));

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-charcoal pb-4 border-b border-lavender mb-8">
        {t("heading")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <ProjectCard
            key={card._fullSlug}
            project={card}
            locale={locale}
            overrideHref={`/${locale}/projects/${card._fullSlug}`}
          />
        ))}
      </div>
    </section>
  );
}
