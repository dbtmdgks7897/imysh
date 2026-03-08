import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProjectFrontmatter } from "@/lib/markdown";
import TechTag from "@/components/ui/TechTag";
import StatusBadge from "@/components/ui/StatusBadge";

interface ProjectHeaderProps {
  frontmatter: ProjectFrontmatter;
  slugPath: string[];
  locale: string;
}

export default function ProjectHeader({
  frontmatter,
  slugPath,
  locale,
}: ProjectHeaderProps) {
  const t = useTranslations("projectHeader");
  const isSubProject = slugPath.length > 1;
  const parentSlug = slugPath.slice(0, -1);

  return (
    <header>
      {isSubProject && (
        <div className="mb-4">
          <Link
            href={`/${locale}/projects/${parentSlug.join("/")}`}
            className="text-sm text-taupe hover:text-sage transition-colors flex items-center gap-1"
          >
            ← {parentSlug[parentSlug.length - 1]}
          </Link>
        </div>
      )}
      <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
        {frontmatter.title}
      </h1>
      <p className="mt-2 text-lg text-taupe">{frontmatter.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-mid-gray">{frontmatter.period}</span>
        <div className="flex flex-wrap gap-1">
          {frontmatter.stack.map((tech) => (
            <TechTag key={tech} label={tech} />
          ))}
        </div>
        <StatusBadge status={frontmatter.status} />
      </div>
      {(frontmatter.liveUrl || frontmatter.githubUrl) && (
        <div className="mt-4 flex items-center gap-3">
          {frontmatter.liveUrl && (
            <a
              href={frontmatter.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-sage hover:text-dark-sage transition-colors"
            >
              <ExternalLink size={14} />
              {t("live")}
            </a>
          )}
          {frontmatter.githubUrl && (
            <a
              href={frontmatter.githubUrl}
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
