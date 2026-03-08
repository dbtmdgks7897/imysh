import { Github, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import TechTag from "@/components/ui/TechTag";

const HERO_NAME = "imysh";
const HERO_STACK = ["Next.js", "TypeScript", "React", "FastAPI", "Tailwind CSS"];
const SOCIAL_LINKS = [
  { href: "https://github.com/dbtmdgks7897", label: "GitHub", icon: Github },
  { href: "mailto:yshdev7897@gmail.com", label: "Email", icon: Mail },
];

export default function HeroSection() {
  const t = useTranslations("hero");
  return (
    <section className="py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl font-bold text-charcoal">
        {HERO_NAME}
      </h1>
      <p className="mt-3 text-lg text-taupe">{t("tagline")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {HERO_STACK.map((tech) => (
          <TechTag key={tech} label={tech} />
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={label}
            className="text-taupe hover:text-sage transition-colors"
          >
            <Icon size={20} />
          </a>
        ))}
      </div>
    </section>
  );
}
