// Смоук вёрстки: на телефоне открыт либо список, либо диалог; на десктопе — оба.
// node scripts/smoke.mjs [база]
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3000";
const executablePath = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const dialogs = ["/c/self", "/c/live", "/c/projects", "/c/checkpoint", "/c/chestor_bot", "/c/selfrotgram"];
const cases = [
  { width: 390, path: "/", sidebar: true, pane: false },
  ...dialogs.map((path) => ({ width: 390, path, sidebar: false, pane: true })),
  { width: 1440, path: "/", sidebar: true, pane: true },
  ...dialogs.map((path) => ({ width: 1440, path, sidebar: true, pane: true })),
];

const browser = await chromium.launch({ executablePath });
let failed = 0;
for (const theme of ["human", "ghoul"]) {
  for (const item of cases) {
    const context = await browser.newContext({ viewport: { width: item.width, height: 800 } });
    await context.addInitScript((value) => localStorage.setItem("chestor-theme", value), theme);
    const page = await context.newPage();
    await page.goto(base + item.path, { waitUntil: "load" });
    const seen = await page.evaluate(() => {
      const visible = (selector) => {
        const node = document.querySelector(selector);
        const rect = node?.getBoundingClientRect();
        return Boolean(rect && rect.width > 0 && rect.height > 0);
      };
      return { sidebar: visible("aside"), pane: visible("main"), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    const ok = seen.sidebar === item.sidebar && seen.pane === item.pane && !seen.overflow;
    if (!ok) {
      failed += 1;
      console.log(`FAIL [${theme}] ${item.width}px ${item.path}`, JSON.stringify(seen));
    }
    await context.close();
  }
}
await browser.close();
console.log(failed ? `Провалов: ${failed}` : "Вёрстка в порядке");
process.exit(failed ? 1 : 0);
