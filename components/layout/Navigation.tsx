import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locales";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navigation({ locale }: { locale: Locale }) {
  const t = useTranslations("nav");
  const link = "flex min-h-11 items-center rounded-full px-3 text-text no-underline transition-colors hover:text-accent-text";
  return (
    <header className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
      <nav aria-label={t("label")} className="flex flex-wrap items-center justify-between gap-x-3 py-3 text-sm md:py-5">
        <Link href={`/${locale}`} className="flex min-h-11 items-center gap-2 font-bold tracking-wide text-text">
          <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full bg-accent" />
          IMYSH
        </Link>
        <div className="flex flex-wrap items-center">
          <Link href={`/${locale}#now`} className={link}>
            {t("now")}
          </Link>
          <Link href={`/${locale}#path`} className={link}>
            {t("path")}
          </Link>
          <LanguageSwitcher label={t("language")} />
        </div>
      </nav>
    </header>
  );
}
