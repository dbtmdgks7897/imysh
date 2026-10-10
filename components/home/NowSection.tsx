import ResponsiveImage from "@/components/ui/ResponsiveImage";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import type { Now, NowText } from "@/lib/content/schema";
import { projectHref } from "@/lib/content/projects";
import SocialLinks from "@/components/ui/SocialLinks";

interface NowSectionProps {
  locale: Locale;
  now: Now;
  text: NowText;
}

export default function NowSection({ locale, now, text }: NowSectionProps) {
  const t = useTranslations("now");
  const { statement } = text;

  return (
    <section id="now" aria-labelledby="now-heading" className="scroll-mt-4 border-t border-border pt-10 pb-16 md:pt-14 md:pb-24">
      <p className="mb-6 text-sm text-text-muted">
        {t("label")} / {now.asOf}
      </p>

      <div className={now.portrait ? "grid items-end gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" : ""}>
        <h1
          id="now-heading"
          className="pb-6 text-[clamp(30px,5vw,68px)] leading-[1.3] font-bold tracking-[0.01em]"
        >
          {statement.before}
          <span className="bg-[linear-gradient(transparent_62%,var(--color-accent-tint)_62%)] text-accent-text">
            {statement.accent}
          </span>
          {statement.after}
        </h1>
        {now.portrait && (
          <div data-avoid className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-placeholder">
            <ResponsiveImage src={now.portrait} alt={t("portraitAlt")} priority className="absolute inset-0 h-full w-full object-cover object-top" sizes="(min-width: 768px) 35vw, 360px" />
          </div>
        )}
      </div>

      <div className="mt-12 grid items-stretch gap-6 md:mt-14 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
        <div data-avoid>
          <p className="mb-3 text-sm text-text-muted">{t("thinking")}</p>
          {text.thinking.map((line) => (
            <p key={line} className="mb-3 max-w-[40em] leading-[1.9]">
              {line}
            </p>
          ))}
        </div>

        {now.cards.map((card) => {
          const copy = text.cards[card.id];
          const href = card.project ? projectHref(locale, card.project.split("/")) : card.href;
          const body = (
            <>
              {card.image && (
                <div className="relative aspect-video bg-placeholder">
                  <ResponsiveImage src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover object-top" sizes="(min-width: 768px) 25vw, 100vw" />
                </div>
              )}
              <div className="px-5 pt-4 pb-5">
                <p className="text-xs tracking-wide text-accent-text">{copy.label}</p>
                <p className="mt-1 text-2xl font-bold">{copy.title}</p>
                <p className="mt-1 text-sm leading-[1.8] text-text-soft">{copy.text}</p>
              </div>
            </>
          );
          const cardClass = "block overflow-hidden rounded-[20px] bg-surface shadow-card";
          if (!href) return <div key={card.id} data-avoid className={cardClass}>{body}</div>;
          return card.project ? (
            <Link key={card.id} href={href} data-avoid className={`${cardClass} transition-shadow hover:shadow-card-hover`}>
              {body}
            </Link>
          ) : (
            <a key={card.id} href={href} data-avoid target="_blank" rel="noopener noreferrer" className={`${cardClass} transition-shadow hover:shadow-card-hover`}>
              {body}
            </a>
          );
        })}

        <div data-avoid>
          <p className="mb-3 text-sm text-text-muted">{t("others")}</p>
          <ul className="border-b border-border">
            {now.oneLiners.map((item) => (
              <li key={item.id} className="flex items-center gap-2.5 border-t border-border py-3">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                <span>{text.oneLiners[item.id]}</span>
                <span className="ml-auto shrink-0 text-sm text-text-muted">{t("since", { since: item.since })}</span>
              </li>
            ))}
          </ul>
          <p className="sr-only">{t("contact")}</p>
          <SocialLinks className="mt-4 -ml-2.5" />
        </div>
      </div>
    </section>
  );
}
