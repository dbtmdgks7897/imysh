"use client";

import { usePathname, useRouter } from "next/navigation";

const locales = [
  { code: "ko", label: "KO" },
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] ?? "ko";

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    localStorage.setItem("locale", newLocale);
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center gap-1 text-sm font-mono">
      {locales.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
          {i > 0 && <span className="text-mid-gray select-none">|</span>}
          <button
            onClick={() => switchLocale(l.code)}
            className={
              l.code === currentLocale
                ? "text-sage font-semibold"
                : "text-taupe hover:text-charcoal transition-colors"
            }
            aria-pressed={l.code === currentLocale}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
