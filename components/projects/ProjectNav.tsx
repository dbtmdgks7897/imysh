import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import { projectHref } from "@/lib/content/projects";

export interface NavLink {
  href: string;
  title: string;
}

interface ProjectNavProps {
  slugPath: string[];
  locale: Locale;
  prev: NavLink | null;
  next: NavLink | null;
}

export default function ProjectNav({ slugPath, locale, prev, next }: ProjectNavProps) {
  const t = useTranslations("projectNav");

  if (slugPath.length > 1) {
    return (
      <nav className="mt-16 pt-8 border-t border-lavender flex">
        <Link
          href={projectHref(locale, slugPath.slice(0, -1))}
          className="text-sm text-taupe hover:text-sage transition-colors"
        >
          {t("parentProject")}
        </Link>
      </nav>
    );
  }

  return (
    <nav className="mt-16 pt-8 border-t border-lavender flex items-center justify-between">
      <Link href={`/${locale}/`} className="text-sm text-taupe hover:text-sage transition-colors">
        {t("allProjects")}
      </Link>
      <div className="flex gap-6">
        {prev && (
          <Link href={prev.href} className="text-sm text-taupe hover:text-sage transition-colors">
            ← {prev.title}
          </Link>
        )}
        {next && (
          <Link href={next.href} className="text-sm text-taupe hover:text-sage transition-colors">
            {next.title} →
          </Link>
        )}
      </div>
    </nav>
  );
}
