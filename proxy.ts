import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, type Locale } from "./lib/i18n";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getLocaleFromCookie(request: NextRequest): Locale | null {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }
  return null;
}

function getLocaleFromHeaders(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language") || "";
  const headers = { "accept-language": acceptLanguage };
  const languages = new Negotiator({ headers }).languages();

  try {
    return match(languages, [...locales], defaultLocale) as Locale;
  } catch {
    return defaultLocale;
  }
}

function setLocaleCookie(response: NextResponse, locale: Locale): NextResponse {
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal paths, static files, and Sentry tunnel
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/monitoring") ||
    pathname.includes(".") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return;
  }

  const cookieLocale = getLocaleFromCookie(request);

  // Redirect /ru and /ru/... to / and /...
  // Default locale (ru) doesn't need prefix in URL
  if (pathname === "/ru" || pathname.startsWith("/ru/")) {
    const newPathname = pathname.replace(/^\/ru/, "") || "/";
    request.nextUrl.pathname = newPathname;
    const response = NextResponse.redirect(request.nextUrl);
    // User explicitly chose Russian — save preference
    if (cookieLocale !== "ru") {
      setLocaleCookie(response, "ru");
    }
    return response;
  }

  // /en and /en/... — user explicitly chose English
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    // Save preference if different from cookie
    if (cookieLocale !== "en") {
      const response = NextResponse.next();
      setLocaleCookie(response, "en");
      return response;
    }
    return;
  }

  // No locale prefix — check user preference
  // Priority: 1. Cookie (explicit choice) 2. Accept-Language 3. Default
  const preferredLocale = cookieLocale ?? getLocaleFromHeaders(request);

  // If user prefers English, redirect to /en/...
  if (preferredLocale === "en") {
    request.nextUrl.pathname = `/en${pathname}`;
    const response = NextResponse.redirect(request.nextUrl);
    // Set cookie if not already set (first visit)
    if (!cookieLocale) {
      setLocaleCookie(response, "en");
    }
    return response;
  }

  // Russian is default — rewrite internally to /ru/... but keep clean URL
  request.nextUrl.pathname = `/ru${pathname}`;
  const response = NextResponse.rewrite(request.nextUrl);
  // Set cookie if not already set (first visit)
  if (!cookieLocale) {
    setLocaleCookie(response, "ru");
  }
  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    // Skip all static files
    "/((?!_next|api|.*\\..*).*)",
  ],
};
