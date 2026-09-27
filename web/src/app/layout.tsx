import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Onest, Unbounded } from "next/font/google";
import type { ReactNode } from "react";

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
  title: "CheStor",
  description: "Self — бэкенд, Telegram-боты и «Токийский гуль».",
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
      <body>{children}</body>
    </html>
  );
}
