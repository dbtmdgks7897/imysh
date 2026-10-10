import Link from "next/link";
import ResponsiveImage from "@/components/ui/ResponsiveImage";
import type { Locale } from "@/lib/locales";
import { projectHref, type Project } from "@/lib/content/projects";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const { title, summary, meta } = project;
  return (
    <Link
      href={projectHref(locale, project.slugPath)}
      className="block overflow-hidden rounded-[20px] bg-surface shadow-card transition-shadow hover:shadow-card-hover"
    >
      {meta.thumbnail && (
        <div className="relative aspect-video bg-placeholder">
          <ResponsiveImage src={meta.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover object-top" sizes="(min-width: 768px) 30vw, 100vw" />
        </div>
      )}
      <div className="flex flex-col gap-2 px-5 pt-4 pb-5">
        <p className="text-lg font-bold">{title}</p>
        <p className="text-sm leading-[1.8] text-text-soft">{summary}</p>
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={meta.status} />
          <span className="text-sm text-text-muted">{meta.period}</span>
        </div>
      </div>
    </Link>
  );
}
