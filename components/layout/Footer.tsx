import { Github, Mail } from "lucide-react";

const SOCIAL_LINKS = [
  {
    href: "https://github.com/dbtmdgks7897",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "mailto:yshdev7897@gmail.com",
    label: "Email",
    icon: Mail,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-lavender bg-light-lavender">
      <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-8">
        <p className="text-sm text-taupe">© 2026 imysh</p>
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="text-taupe hover:text-sage transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
