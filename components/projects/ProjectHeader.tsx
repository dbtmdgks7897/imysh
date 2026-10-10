import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import { projectHref, type Project } from "@/lib/content/projects";
import TechTag from "@/components/ui/TechTag";
import StatusBadge from "@/components/ui/StatusBadge";

interface ProjectHeaderProps {
  project: Project;
  locale: Locale;
  parentTitle?: string;
}

export default function ProjectHeader({ project, locale, parentTitle }: ProjectHeaderProps) {
  const t = useTranslations("projectHeader");
  const { slugPath, meta } = project;
  const parentSlug = slugPath.slice(0, -1);
  const { live, github } = meta.links;

  return (
    <header className="pb-6 border-b border-lavender">
      {parentSlug.length > 0 && (
        <div className="mb-4">
          <Link
            href={projectHref(locale, parentSlug)}
            className="text-sm text-taupe hover:text-sage transition-colors flex items-center gap-1"
          >
            ← {parentTitle ?? parentSlug[parentSlug.length - 1]}
          </Link>
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-charcoal">{project.title}</h1>
      <p className="mt-2 text-lg text-taupe">{project.summary}</p>
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={meta.status} />
          <span className="text-sm text-mid-gray">{meta.period}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {meta.stack.map((tech) => (
            <TechTag key={tech} label={tech} />
          ))}
        </div>
      </div>
      {(live || github) && (
        <div className="mt-4 flex items-center gap-3">
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-sage hover:text-dark-sage transition-colors"
            >
              <ExternalLink size={14} />
              {t("live")}
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-taupe hover:text-charcoal transition-colors"
            >
              <Github size={14} />
              {t("github")}
            </a>
          )}
        </div>
      )}
    </header>
  );
}
