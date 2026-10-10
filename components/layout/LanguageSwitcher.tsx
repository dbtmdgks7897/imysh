"use client";

import { usePathname, useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/locales";

const LABELS: Record<(typeof LOCALES)[number], string> = { ja: "JA", ko: "KO" };

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || DEFAULT_LOCALE;

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center gap-1 text-sm font-mono">
      {LOCALES.map((code, i) => (
        <span key={code} className="flex items-center gap-1">
          {i > 0 && <span className="text-mid-gray select-none">|</span>}
          <button
            onClick={() => switchLocale(code)}
            className={
              code === currentLocale
                ? "text-sage font-semibold"
                : "text-taupe hover:text-charcoal transition-colors"
            }
            aria-pressed={code === currentLocale}
          >
            {LABELS[code]}
          </button>
        </span>
      ))}
    </div>
  );
}
