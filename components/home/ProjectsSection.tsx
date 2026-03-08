import { useTranslations } from "next-intl";
import { PROJECTS } from "@/lib/projects";
import ProjectCard from "@/components/projects/ProjectCard";

interface ProjectsSectionProps {
  locale: string;
}

export default function ProjectsSection({ locale }: ProjectsSectionProps) {
  const t = useTranslations("home");
  return (
    <section className="py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-charcoal pb-4 border-b border-lavender mb-8">
        {t("projectsHeading")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.slug} project={project} locale={locale} />
        ))}
      </div>
    </section>
  );
}
