export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get localized path. Russian (default) has no prefix, English has /en prefix.
 */
export function getLocalizedPath(path: string, locale: Locale): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Russian is default — no prefix
  if (locale === "ru") {
    return normalizedPath;
  }

  // Other locales get prefix
  // For root path, return /en instead of /en/
  if (normalizedPath === "/") {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}
