// Скриншоты страниц в обеих темах на 1440 и 390 px: node scripts/screenshots.mjs [база] [пути…]
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3000";
const paths = process.argv.length > 3 ? process.argv.slice(3) : ["/"];
const executablePath = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const widths = [
  { name: "desktop", width: 1440, height: Number(process.env.HEIGHT ?? 900) },
  { name: "mobile", width: 390, height: Number(process.env.HEIGHT ?? 844) },
];
const themes = ["human", "ghoul"];

await mkdir("screenshots", { recursive: true });
const browser = await chromium.launch({ executablePath });

for (const viewport of widths) {
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    await context.addInitScript((value) => localStorage.setItem("chestor-theme", value), theme);
    const page = await context.newPage();
    for (const path of paths) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const slug = path.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "root";
      const file = `screenshots/${slug}-${viewport.name}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: process.env.FULL === "1" });
      console.log(file);
    }
    await context.close();
  }
}

await browser.close();
