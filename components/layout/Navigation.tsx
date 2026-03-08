import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navigation({ locale }: { locale: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-lavender bg-snow/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}/`}
          className="text-lg font-semibold text-charcoal hover:text-sage transition-colors"
        >
          imysh
        </Link>
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
