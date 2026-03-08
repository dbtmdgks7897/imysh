import Link from "next/link";
import Image from "next/image";
import { Project } from "@/lib/projects";
import TechTag from "@/components/ui/TechTag";
import StatusBadge from "@/components/ui/StatusBadge";

interface ProjectCardProps {
  project: Project;
  locale: string;
  overrideHref?: string;
}

export default function ProjectCard({ project, locale, overrideHref }: ProjectCardProps) {
  const href = overrideHref ?? `/${locale}/projects/${project.slug}`;
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-lavender bg-snow overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative aspect-video bg-light-lavender">
        {project.thumbnail && (
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-charcoal">{project.title}</h3>
          <p className="text-sm text-dark-gray mt-1">{project.summary}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {project.stack.map((tech) => (
            <TechTag key={tech} label={tech} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status} />
          <span className="text-xs text-mid-gray">{project.period}</span>
        </div>
      </div>
    </Link>
  );
}
