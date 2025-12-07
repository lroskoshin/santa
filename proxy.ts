import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";

function getLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (
    cookieLocale &&
    locales.includes(cookieLocale as (typeof locales)[number])
  ) {
    return cookieLocale;
  }

  // Then use Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  const headers = { "accept-language": acceptLanguage };
  const languages = new Negotiator({ headers }).languages();

  try {
    return match(languages, [...locales], defaultLocale);
  } catch {
    return defaultLocale;
  }
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

  // Redirect /ru and /ru/... to / and /...
  // Default locale (ru) doesn't need prefix in URL
  if (pathname === "/ru" || pathname.startsWith("/ru/")) {
    const newPathname = pathname.replace(/^\/ru/, "") || "/";
    request.nextUrl.pathname = newPathname;
    return NextResponse.redirect(request.nextUrl);
  }

  // /en and /en/... — keep as is (non-default locale needs prefix)
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return;
  }

  // No locale prefix — check user preference
  const locale = getLocale(request);

  // If user prefers English, redirect to /en/...
  if (locale === "en") {
    request.nextUrl.pathname = `/en${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Russian is default — rewrite internally to /ru/... but keep clean URL
  request.nextUrl.pathname = `/ru${pathname}`;
  return NextResponse.rewrite(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    // Skip all static files
    "/((?!_next|api|.*\\..*).*)",
  ],
};
