import { ExternalLink, Github } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Project } from "@/lib/content/projects";
import StatusBadge from "@/components/ui/StatusBadge";
import TechTag from "@/components/ui/TechTag";

export default function ProjectInfoCard({ project }: { project: Project }) {
  const t = useTranslations("detail");
  const { period, status, stack, links } = project.meta;
  return (
    <div className="rounded-[20px] bg-surface p-6 text-sm">
      <dl className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5">
        <dt className="text-text-muted">{t("period")}</dt>
        <dd>{period}</dd>
        <dt className="text-text-muted">{t("status")}</dt>
        <dd>
          <StatusBadge status={status} />
        </dd>
      </dl>
      {stack.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-text-muted">{t("stack")}</p>
          <ul className="flex flex-wrap gap-1.5">
            {stack.map((tech) => (
              <li key={tech}>
                <TechTag label={tech} />
              </li>
            ))}
          </ul>
        </>
      )}
      {(links.live || links.github) && (
        <ul className="mt-4 flex flex-wrap gap-x-4">
          {links.live && (
            <li>
              <a href={links.live} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1.5 text-accent-text underline decoration-accent decoration-2 underline-offset-4 hover:text-text">
                <ExternalLink size={16} aria-hidden="true" />
                {t("live")}
              </a>
            </li>
          )}
          {links.github && (
            <li>
              <a href={links.github} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1.5 text-accent-text underline decoration-accent decoration-2 underline-offset-4 hover:text-text">
                <Github size={16} aria-hidden="true" />
                {t("github")}
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
