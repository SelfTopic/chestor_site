// JSON-LD (schema.org) для поисковиков и ИИ-поиска. Всё собирается из тех же объектов контента,
// что и видимый текст страниц, чтобы разметка не расходилась со страницей.
import { BOT_FAQ, BOT_HERO, BOT_REPO, BOT_TELEGRAM } from "@/content/bot";
import { OWNER } from "@/content/owner";
import { SR_LINKS } from "@/content/selfrotgram";

import { SITE_URL } from "./site";

type JsonLd = Record<string, unknown>;

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function personLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: OWNER.gitName,
    alternateName: [OWNER.name, "SelfTopic"],
    url: SITE_URL,
    email: OWNER.links.email.href,
    jobTitle: "Бэкенд-разработчик",
    knowsAbout: ["Python", "Telegram Bot API", "TypeScript", "PostgreSQL", "Docker"],
    sameAs: [OWNER.links.github.href, OWNER.links.telegram.href],
  };
}

export function websiteLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "CheStor",
    inLanguage: "ru",
    author: { "@id": PERSON_ID },
  };
}

export function botGameLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: BOT_HERO.object,
    alternateName: [BOT_TELEGRAM.label, "Токийский гуль RPG в Telegram", "Tokyo Ghoul RPG bot for Telegram"],
    description: BOT_HERO.lead,
    url: `${SITE_URL}/bot`,
    sameAs: [BOT_TELEGRAM.href, BOT_REPO],
    gamePlatform: "Telegram",
    applicationCategory: "GameApplication",
    genre: ["RPG", "Текстовая RPG"],
    playMode: "MultiPlayer",
    inLanguage: "ru",
    softwareVersion: "1.0.0",
    isBasedOn: { "@type": "CreativeWork", name: "Tokyo Ghoul", alternateName: "Токийский гуль" },
    author: { "@id": PERSON_ID },
  };
}

export function botFaqLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: BOT_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function selfrotgramLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "selfrotgram",
    description:
      "Асинхронная библиотека для Telegram Bot API на Python (aiohttp, pydantic), где типы говорят правду: фильтр гарантирует поле, тип это знает, библиотека сверяет при импорте.",
    url: `${SITE_URL}/selfrotgram`,
    codeRepository: SR_LINKS.github,
    sameAs: [SR_LINKS.pypi],
    programmingLanguage: "Python",
    runtimePlatform: "Python 3.11+",
    license: "https://opensource.org/licenses/MIT",
    author: { "@id": PERSON_ID },
  };
}

// Внутри <script> нельзя допустить «</script>»: экранируем «<», JSON от этого не меняется.
export function serializeLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
