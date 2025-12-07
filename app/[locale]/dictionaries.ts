import { isValidLocale, defaultLocale, type Locale } from "@/lib/i18n";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  ru: () => import("@/dictionaries/ru.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale | string) => {
  const validLocale = isValidLocale(locale) ? locale : defaultLocale;
  return dictionaries[validLocale]();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
