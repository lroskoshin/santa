import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import { getDictionary } from "./dictionaries";
import { locales, getLocalizedPath, type Locale } from "@/lib/i18n";
import { LocaleSwitcher } from "./components/locale-switcher";

const YANDEX_METRIKA_ID = 105719051;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const siteUrl = "https://wesanta.club";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return {
    title: {
      default: dict.metadata.title,
      template: dict.metadata.titleTemplate,
    },
    description: dict.metadata.description,
    keywords:
      locale === "ru"
        ? [
            "тайный санта",
            "тайный санта онлайн",
            "генератор тайного санты",
            "жеребьёвка подарков",
            "обмен подарками",
            "новогодние подарки",
            "wesanta",
          ]
        : [
            "secret santa",
            "secret santa online",
            "secret santa generator",
            "gift exchange",
            "christmas gift exchange",
            "holiday gift exchange",
            "wesanta",
          ],
    authors: [{ name: "WeSanta Team" }],
    creator: "WeSanta",
    publisher: "WeSanta",

    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: getLocalizedPath("/", locale),
      languages: {
        "ru": "/",
        "en": "/en",
      },
    },

    openGraph: {
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      url: siteUrl,
      siteName: "WeSanta",
      title: dict.metadata.ogTitle,
      description: dict.metadata.ogDescription,
    },

    twitter: {
      card: "summary_large_image",
      title: dict.metadata.ogTitle,
      description: dict.metadata.ogDescription,
      creator: "@wesanta",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",

    category: "entertainment",
    classification: "Gift Exchange, Holiday Planning",
  };
}

// JSON-LD структурированные данные для Google
function getJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WeSanta",
    alternateName: locale === "ru" ? "Тайный Санта онлайн" : "Secret Santa Online",
    url: siteUrl,
    description:
      locale === "ru"
        ? "Бесплатный сервис для организации Тайного Санты. Создайте комнату, пригласите друзей и узнайте, кому дарить подарок!"
        : "Free Secret Santa organizer. Create a room, invite friends and find out who you're giving a gift to!",
    applicationCategory: "Entertainment",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: locale === "ru" ? "RUB" : "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "150",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const jsonLd = getJsonLd(locale);

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} flex min-h-screen flex-col antialiased`}
      >
        {/* Beta Banner */}
        <div className="border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2.5 text-center text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="font-medium text-amber-400">
                {dict.layout.beta}
              </span>
            </span>
            <span className="text-slate-400">{dict.layout.betaMessage}</span>
            <a
              href="https://t.me/wesantaclub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-sky-400 transition-colors hover:bg-sky-500/30 hover:text-sky-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              {dict.layout.telegramLink}
            </a>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-start px-4 pt-4 pb-2 bg-[#0c1222]">
          <LocaleSwitcher currentLocale={locale} />
        </div>

        <main className="flex flex-1 flex-col">{children}</main>

        <footer className="border-t border-slate-800 bg-[#0c1222] py-6">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>WeSanta © {new Date().getFullYear()}</span>
            <span>·</span>
            <a
              href="https://t.me/wesantaclub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-400 transition-colors hover:text-sky-400"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              {dict.layout.telegram}
            </a>
          </div>
        </footer>

        {/* Yandex.Metrika counter */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}', 'ym');

              ym(${YANDEX_METRIKA_ID}, 'init', {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true,
                ecommerce: "dataLayer"
              });
            `,
          }}
        />
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}

