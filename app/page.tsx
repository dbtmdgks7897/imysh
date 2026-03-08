"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LOCALES = ["ko", "ja", "en"] as const;
type Locale = (typeof LOCALES)[number];

function detectLocale(): Locale {
  if (typeof window === "undefined") return "ko";

  const stored = localStorage.getItem("locale") as Locale | null;
  if (stored && LOCALES.includes(stored)) return stored;

  const browserLang = navigator.language.split("-")[0] as Locale;
  if (LOCALES.includes(browserLang)) return browserLang;

  return "ko";
}

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${detectLocale()}/`);
  }, [router]);
  return null;
}
