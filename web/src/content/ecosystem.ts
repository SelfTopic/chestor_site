// Схема из docs/CONTENT.md плюс сам сайт (он собран на selfrotgram и ghoul-quiz-lib).
export type EcoNodeId = "selfrotgram" | "example" | "chestor_bot" | "quizlib" | "api" | "userbot" | "site";

export type EcoNode = { id: EcoNodeId; title: string; caption: string; accent?: boolean; href?: string };
export type EcoEdge = { from: EcoNodeId; to: EcoNodeId; label?: string };

export const ECO_NODES: readonly EcoNode[] = [
  { id: "selfrotgram", title: "selfrotgram", caption: "PyPI", href: "/selfrotgram" },
  { id: "example", title: "example_bot", caption: "витрина приёмов", href: "https://github.com/SelfTopic/selfrotgram_example_bot" },
  { id: "chestor_bot", title: "chestor_bot", caption: "RPG по «Гулю»", accent: true, href: "/bot" },
  { id: "quizlib", title: "ghoul-quiz-lib", caption: "клиент API", href: "https://github.com/SelfTopic/questions_ghoul_api_lib" },
  { id: "api", title: "Ghoul API", caption: "chestor.site/api", href: "https://github.com/SelfTopic/questions_ghoul_api" },
  { id: "userbot", title: "userbot-api", caption: "живые тесты", href: "https://github.com/SelfTopic/userbot-api" },
  { id: "site", title: "chestor.site", caption: "этот сайт", accent: true, href: "/" },
];

export const ECO_EDGES: readonly EcoEdge[] = [
  { from: "selfrotgram", to: "chestor_bot" },
  { from: "quizlib", to: "chestor_bot" },
  { from: "quizlib", to: "api", label: "HTTPS" },
  { from: "example", to: "selfrotgram" },
  { from: "userbot", to: "chestor_bot", label: "проверяет" },
  { from: "selfrotgram", to: "site" },
  { from: "quizlib", to: "site" },
];

export type EcoLayout = { width: number; height: number; node: { w: number; h: number }; at: Record<EcoNodeId, [number, number]> };

export const ECO_WIDE: EcoLayout = {
  width: 560,
  height: 330,
  node: { w: 136, h: 52 },
  at: {
    userbot: [280, 36],
    selfrotgram: [78, 160],
    chestor_bot: [280, 160],
    quizlib: [482, 160],
    example: [78, 290],
    site: [280, 290],
    api: [482, 290],
  },
};

export const ECO_NARROW: EcoLayout = {
  width: 340,
  height: 560,
  node: { w: 130, h: 54 },
  at: {
    userbot: [170, 40],
    chestor_bot: [170, 150],
    selfrotgram: [75, 270],
    quizlib: [265, 270],
    site: [170, 390],
    example: [75, 510],
    api: [265, 510],
  },
};
