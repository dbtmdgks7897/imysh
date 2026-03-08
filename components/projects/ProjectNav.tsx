import Link from "next/link";
import { PROJECTS } from "@/lib/projects";

interface ProjectNavProps {
  slugPath: string[];
  locale: string;
}

export default function ProjectNav({ slugPath, locale }: ProjectNavProps) {
  const isSubProject = slugPath.length > 1;

  if (isSubProject) {
    const parentSlug = slugPath.slice(0, -1).join("/");
    return (
      <nav className="mt-16 pt-8 border-t border-lavender flex">
        <Link
          href={`/${locale}/projects/${parentSlug}`}
          className="text-sm text-taupe hover:text-sage transition-colors"
        >
          ← 상위 프로젝트로
        </Link>
      </nav>
    );
  }

  const currentIndex = PROJECTS.findIndex((p) => p.slug === slugPath[0]);
  const prev = currentIndex > 0 ? PROJECTS[currentIndex - 1] : null;
  const next =
    currentIndex < PROJECTS.length - 1 ? PROJECTS[currentIndex + 1] : null;

  return (
    <nav className="mt-16 pt-8 border-t border-lavender flex items-center justify-between">
      <Link
        href={`/${locale}/`}
        className="text-sm text-taupe hover:text-sage transition-colors"
      >
        ← 모든 프로젝트
      </Link>
      <div className="flex gap-6">
        {prev && (
          <Link
            href={`/${locale}/projects/${prev.slug}`}
            className="text-sm text-taupe hover:text-sage transition-colors"
          >
            ← {prev.title}
          </Link>
        )}
        {next && (
          <Link
            href={`/${locale}/projects/${next.slug}`}
            className="text-sm text-taupe hover:text-sage transition-colors"
          >
            {next.title} →
          </Link>
        )}
      </div>
    </nav>
  );
}
