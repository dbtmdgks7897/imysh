import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import type { Project } from "@/lib/content/projects";
import ProjectCard from "@/components/projects/ProjectCard";

export default function SubProjectList({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const t = useTranslations("detail");
  if (projects.length === 0) return null;
  return (
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-bold">{t("children")}</h3>
      <ul className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.slugPath.join("/")}>
            <ProjectCard project={project} locale={locale} />
          </li>
        ))}
      </ul>
    </div>
  );
}
