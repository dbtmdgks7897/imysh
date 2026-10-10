import { notFound } from "next/navigation";

// Order matters: the first entry is the default and is listed first in the switcher.
export const LOCALES = ["ja", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ja";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

// For route params: unknown locale segments become a 404 instead of a cast.
export function assertLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}
