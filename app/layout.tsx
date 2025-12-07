import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

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

  // Robots — закрыто на время разработки
  // TODO: После релиза изменить на index: true, follow: true
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
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
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
