import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import { personLd, websiteLd } from "@/lib/structuredData";
import { THEME_COLOR, themeInitScript } from "@/lib/theme";

import "./globals.css";

const onest = Onest({ subsets: ["latin", "cyrillic"], variable: "--font-onest", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  weight: ["600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "CheStor — Self в виде Telegram-клиента", template: "%s · CheStor" },
  description:
    "Self (CheStor): бэкенд на Python, Telegram-боты, свой фреймворк selfrotgram и «Токийский гуль». Сайт — это Telegram-клиент с живым чатом.",
  applicationName: "CheStor",
  authors: [{ name: "Self", url: "https://github.com/SelfTopic" }],
  openGraph: { type: "website", siteName: "CheStor", locale: "ru_RU" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.human },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.ghoul },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${onest.variable} ${jetbrains.variable} ${unbounded.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Тема ставится до первой отрисовки, иначе «Гуль» мигнёт светлым. Строка статична. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <JsonLd data={personLd()} />
        <JsonLd data={websiteLd()} />
      </body>
    </html>
  );
}
