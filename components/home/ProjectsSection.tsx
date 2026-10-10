import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import type { Project } from "@/lib/content/projects";
import ProjectCard from "@/components/projects/ProjectCard";

interface ProjectsSectionProps {
  locale: Locale;
  projects: Project[];
}

export default function ProjectsSection({ locale, projects }: ProjectsSectionProps) {
  const t = useTranslations("home");
  return (
    <section className="py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-charcoal pb-4 border-b border-lavender mb-8">
        {t("projectsHeading")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.slugPath.join("/")} project={project} locale={locale} />
        ))}
      </div>
    </section>
  );
}
