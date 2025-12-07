import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const YANDEX_METRIKA_ID = 105719051;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://wesanta.club";

export const metadata: Metadata = {
  // Основные мета-теги
  title: {
    default: "WeSanta — Тайный Санта онлайн | Бесплатный генератор жеребьёвки",
    template: "%s | WeSanta",
  },
  description:
    "Бесплатный сервис для организации Тайного Санты 🎅 Создай комнату за 10 секунд, пригласи друзей по ссылке, и каждый узнает своего получателя подарка. Без регистрации!",
  keywords: [
    "тайный санта",
    "secret santa",
    "тайный санта онлайн",
    "генератор тайного санты",
    "жеребьёвка подарков",
    "новогодняя жеребьёвка",
    "обмен подарками",
    "кому я дарю подарок",
    "тайный санта бесплатно",
    "организовать тайного санту",
    "wesanta",
  ],
  authors: [{ name: "WeSanta Team" }],
  creator: "WeSanta",
  publisher: "WeSanta",

  // Канонический URL
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      "ru-RU": "/",
    },
  },

  // Open Graph для соцсетей (VK, Facebook, Telegram)
  // Изображение генерируется автоматически из opengraph-image.tsx
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "WeSanta",
    title: "WeSanta — Тайный Санта онлайн 🎅",
    description:
      "Создай комнату, пригласи друзей по ссылке — каждый узнает, кому дарить подарок! Бесплатно и без регистрации.",
  },

  // Twitter Card (и Telegram тоже читает эти теги)
  // Изображение генерируется автоматически из twitter-image.tsx
  twitter: {
    card: "summary_large_image",
    title: "WeSanta — Тайный Санта онлайн 🎅",
    description:
      "Создай комнату, пригласи друзей по ссылке — каждый узнает, кому дарить подарок!",
    creator: "@wesanta",
  },

  // Robots — открыто для индексации
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

  // Иконки
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",

  // Дополнительные мета-теги
  category: "entertainment",
  classification: "Gift Exchange, Holiday Planning",
};

// JSON-LD структурированные данные для Google
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WeSanta",
  alternateName: "Тайный Санта онлайн",
  url: siteUrl,
  description:
    "Бесплатный сервис для организации Тайного Санты. Создайте комнату, пригласите друзей и узнайте, кому дарить подарок!",
  applicationCategory: "Entertainment",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RUB",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased flex min-h-screen flex-col`}>
        {/* Beta Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2.5 text-center text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="font-medium text-amber-400">Beta</span>
            </span>
            <span className="text-slate-400">
              Проект в разработке — если что-то пошло не так, приношу глубочайшие извинения! 🙏
            </span>
            <a
              href="https://t.me/wesantaclub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-sky-400 transition-colors hover:bg-sky-500/30 hover:text-sky-300"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Написать в Telegram
            </a>
          </div>
        </div>

        <main className="flex flex-1 flex-col">
          {children}
        </main>
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
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
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
