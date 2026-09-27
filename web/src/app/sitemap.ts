import type { MetadataRoute } from "next";

import { DIALOG_IDS, dialogHref } from "@/content/dialogs";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/bot", "/selfrotgram", ...DIALOG_IDS.map(dialogHref)];
  return pages.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: path === "/c/live" ? "always" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/c/") ? 0.6 : 0.8,
  }));
}
