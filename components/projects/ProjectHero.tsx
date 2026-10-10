import ResponsiveImage from "@/components/ui/ResponsiveImage";
import Link from "next/link";
import type { Project } from "@/lib/content/projects";

export interface BackLink {
  href: string;
  label: string;
}

export default function ProjectHero({ project, backLinks }: { project: Project; backLinks: BackLink[] }) {
  const { hero, heroFit } = project.meta;
  const contain = heroFit === "contain";
  return (
    <div className="flex flex-wrap overflow-hidden rounded-[28px] bg-surface">
      <div className="flex min-w-0 flex-[1_1_360px] flex-col justify-center px-6 py-8 md:px-10 md:py-12">
        <div className="flex flex-wrap gap-x-4">
          {backLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center text-sm text-accent-text underline decoration-accent decoration-2 underline-offset-4 hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <h1 className="mt-2 text-[clamp(30px,4.6vw,56px)] leading-tight font-bold">{project.title}</h1>
        <p className="mt-3 max-w-[40em] text-lg leading-[1.8] text-text-soft">{project.summary}</p>
      </div>
      {hero && (
        <div className={`relative min-h-[240px] flex-[1.4_1_480px] md:min-h-[360px] ${contain ? "bg-bg" : "bg-placeholder"}`}>
          <ResponsiveImage
            src={hero}
            alt={project.heroAlt ?? ""}
            priority
            className={`absolute inset-0 h-full w-full ${contain ? "object-contain p-4" : "object-cover object-top"}`}
            sizes="(min-width: 768px) 60vw, 100vw"
          />
        </div>
      )}
    </div>
  );
}
