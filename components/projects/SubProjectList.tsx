import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import type { Project } from "@/lib/content/projects";
import ProjectCard from "@/components/projects/ProjectCard";

interface SubProjectListProps {
  projects: Project[];
  locale: Locale;
}

export default function SubProjectList({ projects, locale }: SubProjectListProps) {
  const t = useTranslations("subProjectList");
  if (projects.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-charcoal pb-4 border-b border-lavender mb-8">
        {t("heading")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.slugPath.join("/")} project={project} locale={locale} />
        ))}
      </div>
    </section>
  );
}
