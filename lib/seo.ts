import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/locales";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const OG_LOCALE: Record<Locale, string> = { ja: "ja_JP", ko: "ko_KR" };

// subpath: "" for the hub, "/projects/kigaru/kaouranai" for a detail page.
// No trailing slash: Cloudflare Pages serves ja.html at /ja.
export function localeUrl(locale: Locale, subpath = ""): string {
  return `${SITE_URL}/${locale}${subpath}`;
}

interface PageMetadataInput {
  locale: Locale;
  subpath: string;
  title: string; // full display title, used as-is
  description: string;
  type?: "website" | "article";
}

// Each page returns a complete set: Next merges metadata shallowly, so a child's
// openGraph would otherwise replace the parent's wholesale.
export function pageMetadata({ locale, subpath, title, description, type = "website" }: PageMetadataInput): Metadata {
  const url = localeUrl(locale, subpath);
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, localeUrl(l, subpath)]));
  languages["x-default"] = localeUrl(DEFAULT_LOCALE, subpath);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary", title, description },
  };
}
