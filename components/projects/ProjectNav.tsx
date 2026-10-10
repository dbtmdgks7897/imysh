import Link from "next/link";
import { useTranslations } from "next-intl";

export interface NavLink {
  href: string;
  title: string;
}

export default function ProjectNav({ prev, next }: { prev: NavLink | null; next: NavLink | null }) {
  const t = useTranslations("detail");
  if (!prev && !next) return null;
  const card = "flex min-h-11 flex-[1_1_220px] flex-col rounded-2xl bg-surface px-5 py-4 shadow-card transition-shadow hover:shadow-card-hover";
  return (
    <nav aria-label={t("prevNext")} className="flex flex-wrap gap-4">
      {prev ? (
        <Link href={prev.href} rel="prev" className={card}>
          <span className="text-sm text-text-muted">{t("prev")}</span>
          <b>{prev.title}</b>
        </Link>
      ) : (
        <span className="hidden flex-[1_1_220px] md:block" />
      )}
      {next ? (
        <Link href={next.href} rel="next" className={`${card} text-right`}>
          <span className="text-sm text-text-muted">{t("next")}</span>
          <b>{next.title}</b>
        </Link>
      ) : (
        <span className="hidden flex-[1_1_220px] md:block" />
      )}
    </nav>
  );
}
