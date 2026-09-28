import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Ботов ИИ-поиска и ассистентов зовём явно: часть из них смотрит только на правило со своим именем.
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "YandexAdditional",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_AGENTS, allow: "/", disallow: ["/chat/"] },
      { userAgent: "*", allow: "/", disallow: ["/chat/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
