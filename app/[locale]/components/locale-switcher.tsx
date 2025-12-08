"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

const LOCALE_COOKIE = "NEXT_LOCALE";

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

function setLocaleCookie(locale: Locale) {
  // Set cookie that expires in 1 year
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; max-age=${maxAge}; path=/; samesite=lax`;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  
  // Remove current locale from pathname to get the base path
  const pathnameWithoutLocale = pathname.replace(/^\/(ru|en)/, "") || "/";
  
  // RU is default locale — no prefix needed
  const ruPath = pathnameWithoutLocale;
  // EN needs /en prefix
  const enPath = `/en${pathnameWithoutLocale}`;

  return (
    <div className="inline-flex rounded-full bg-slate-800/80 p-0.5 text-xs font-medium">
      <Link
        href={ruPath}
        onClick={() => setLocaleCookie("ru")}
        className={`rounded-full px-3 py-1.5 transition-all ${
          currentLocale === "ru"
            ? "bg-emerald-500 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        RU
      </Link>
      <Link
        href={enPath}
        onClick={() => setLocaleCookie("en")}
        className={`rounded-full px-3 py-1.5 transition-all ${
          currentLocale === "en"
            ? "bg-emerald-500 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        EN
      </Link>
    </div>
  );
}
