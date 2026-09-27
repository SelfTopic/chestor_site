// axe-core по страницам в обеих темах: node scripts/a11y.mjs [база]
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const base = process.argv[2] ?? "http://localhost:3000";
const paths = ["/", "/c/self", "/c/projects", "/c/live", "/c/checkpoint", "/c/chestor_bot", "/c/selfrotgram", "/bot", "/selfrotgram", "/nope"];
const executablePath = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const browser = await chromium.launch({ executablePath });
let problems = 0;
for (const theme of ["human", "ghoul"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript((value) => localStorage.setItem("chestor-theme", value), theme);
  const page = await context.newPage();
  for (const path of paths) {
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(async () => {
      // @ts-expect-error axe приходит из addScriptTag
      const report = await window.axe.run(document, { resultTypes: ["violations"] });
      return report.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 4).map((n) => n.target.join(" ") + " :: " + (n.failureSummary ?? "").split("\n")[1]) }));
    });
    for (const violation of result) {
      problems += 1;
      console.log(`[${theme}] ${path} ${violation.impact} ${violation.id}`);
      for (const node of violation.nodes) console.log("    " + node);
    }
  }
  await context.close();
}
await browser.close();
console.log(problems ? `Нарушений: ${problems}` : "Нарушений нет");
