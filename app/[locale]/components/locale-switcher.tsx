"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

interface LocaleSwitcherProps {
  currentLocale: Locale;
}

export function LocaleSwitcher({ currentLocale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  
  // Remove current locale from pathname to get the base path
  const pathnameWithoutLocale = pathname.replace(/^\/(ru|en)/, "") || "/";
  
  // Always use explicit locale prefix for switching
  // This ensures proxy sets the cookie BEFORE any redirect happens
  const ruPath = `/ru${pathnameWithoutLocale}`;
  const enPath = `/en${pathnameWithoutLocale}`;

  // Use <a> instead of <Link> to force full page reload
  // This ensures proxy middleware runs and sets the locale cookie correctly
  // With <Link>, soft navigation in production can skip the proxy
  return (
    <div className="inline-flex rounded-full bg-slate-800/80 p-0.5 text-xs font-medium">
      <a
        href={ruPath}
        className={`rounded-full px-3 py-1.5 transition-all ${
          currentLocale === "ru"
            ? "bg-emerald-500 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        RU
      </a>
      <a
        href={enPath}
        className={`rounded-full px-3 py-1.5 transition-all ${
          currentLocale === "en"
            ? "bg-emerald-500 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        EN
      </a>
    </div>
  );
}
