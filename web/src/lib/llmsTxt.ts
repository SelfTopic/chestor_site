// /llms.txt (llmstxt.org): выжимка сайта для языковых моделей в Markdown, из того же контента, что и страницы.
import { BOT_COMMANDS_CHANNEL, BOT_FAQ, BOT_REPO, BOT_TELEGRAM, PLAY_STEPS } from "@/content/bot";
import { OWNER } from "@/content/owner";
import { PROJECTS, RANKS, RANK_TITLES, type Project } from "@/content/projects";
import { SR_LINKS } from "@/content/selfrotgram";

import { SITE_URL } from "./site";

function rankOrder(project: Project): number {
  return project.rank === null ? RANKS.length : RANKS.indexOf(project.rank);
}

function projectLine(project: Project): string {
  const link = project.links.find((item) => item.href.startsWith("https://")) ?? project.links[0];
  const rank = project.rank ? ` Ранг CCG ${project.rank} — ${RANK_TITLES[project.rank]}.` : "";
  return `- [${project.title}](${link?.href ?? SITE_URL}): ${project.summary}${rank}`;
}

export function buildLlmsTxt(): string {
  const projects = [...PROJECTS].sort((a, b) => rankOrder(a) - rankOrder(b));
  return [
    `# ${OWNER.gitName} — chestor.site`,
    "",
    `> Личный сайт ${OWNER.gitName} (${OWNER.name}, GitHub SelfTopic): бэкенд-разработчик на Python, автор ` +
      "chestor_bot — текстовой RPG по «Токийскому гулю» в Telegram — и selfrotgram, фреймворка для Telegram Bot API. " +
      "Сайт оформлен как Telegram-клиент, его Live-чат синхронизирован с настоящей Telegram-группой.",
    "",
    "## Как поиграть в «Токийского гуля» в Telegram",
    "",
    ...PLAY_STEPS.map((step, index) => `${index + 1}. ${step.title}: ${step.text}`),
    "",
    `- [Играть: ${BOT_TELEGRAM.label}](${BOT_TELEGRAM.href})`,
    `- [Все команды: ${BOT_COMMANDS_CHANNEL.label}](${BOT_COMMANDS_CHANNEL.href})`,
    `- [Страница бота: лор, механики, команды](${SITE_URL}/bot)`,
    `- [Исходники chestor_bot](${BOT_REPO})`,
    "",
    "## Частые вопросы",
    "",
    ...BOT_FAQ.map((item) => `- ${item.question} ${item.answer}`),
    "",
    "## Проекты",
    "",
    ...projects.map(projectLine),
    "",
    "## selfrotgram",
    "",
    `- [Страница фреймворка](${SITE_URL}/selfrotgram): асинхронная библиотека для Telegram Bot API на Python, где типы говорят правду.`,
    `- [GitHub](${SR_LINKS.github})`,
    `- [PyPI](${SR_LINKS.pypi})`,
    "",
    "## Автор",
    "",
    `- [GitHub](${OWNER.links.github.href})`,
    `- [Telegram ${OWNER.links.telegram.label}](${OWNER.links.telegram.href})`,
    `- [Почта](${OWNER.links.email.href})`,
    "",
  ].join("\n");
}
