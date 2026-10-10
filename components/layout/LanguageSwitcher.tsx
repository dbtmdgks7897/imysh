"use client";

import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/locales";

const LABELS: Record<Locale, string> = { ja: "JA", ko: "KO" };

export default function LanguageSwitcher({ label }: { label: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || DEFAULT_LOCALE;

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div role="group" aria-label={label} className="flex items-center">
      {LOCALES.map((code) => {
        const active = code === currentLocale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchLocale(code)}
            aria-pressed={active}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 transition-colors ${
              active
                ? "font-bold text-text underline decoration-accent decoration-2 underline-offset-4"
                : "text-text-muted hover:text-accent-text"
            }`}
          >
            {LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
