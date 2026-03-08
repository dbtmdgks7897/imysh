import Link from "next/link";

const locales = [
  { code: "ko", label: "KO" },
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher({ locale }: { locale: string }) {
  return (
    <div className="flex items-center gap-1 text-sm font-mono">
      {locales.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
          {i > 0 && <span className="text-mid-gray select-none">|</span>}
          <Link
            href={`/${l.code}/`}
            className={
              l.code === locale
                ? "text-sage font-semibold"
                : "text-taupe hover:text-charcoal transition-colors"
            }
            aria-current={l.code === locale ? "page" : undefined}
          >
            {l.label}
          </Link>
        </span>
      ))}
    </div>
  );
}
