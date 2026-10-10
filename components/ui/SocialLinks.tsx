import { Github, Mail } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/site";

const ICONS = { github: Github, email: Mail } as const;

// Icon-only contact links with 44px hit targets.
export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {SOCIAL_LINKS.map(({ kind, href, label }) => {
        const Icon = ICONS[kind];
        const external = href.startsWith("http");
        return (
          <li key={kind}>
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full text-text-soft transition-colors hover:bg-surface hover:text-accent-text"
            >
              <Icon size={20} aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
