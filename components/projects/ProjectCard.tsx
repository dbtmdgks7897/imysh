import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/locales";
import { projectHref, type Project } from "@/lib/content/projects";
import TechTag from "@/components/ui/TechTag";
import StatusBadge from "@/components/ui/StatusBadge";

interface ProjectCardProps {
  project: Project;
  locale: Locale;
}

export default function ProjectCard({ project, locale }: ProjectCardProps) {
  const { title, summary, meta } = project;
  return (
    <Link
      href={projectHref(locale, project.slugPath)}
      className="group block rounded-lg border border-lavender bg-snow overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative aspect-video bg-light-lavender overflow-hidden">
        {meta.thumbnail ? (
          <Image src={meta.thumbnail} alt={title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-lavender select-none" aria-label={title}>
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-semibold text-charcoal">{title}</h3>
          <p className="text-sm text-dark-gray mt-1">{summary}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {meta.stack.map((tech) => (
            <TechTag key={tech} label={tech} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={meta.status} />
          <span className="text-xs text-mid-gray">{meta.period}</span>
        </div>
      </div>
    </Link>
  );
}
