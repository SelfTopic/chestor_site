import { describe, expect, test } from "vitest";

import { DIALOG_IDS, DIALOGS } from "./dialogs";
import { OWNER, SELF_MESSAGES, STACK } from "./owner";
import { ARCHIVE_SLUG, PROJECTS, RANKS, TIMELINE } from "./projects";

describe("проекты и хронология", () => {
  test("каждый проект, кроме архива, стоит ровно в одной эпохе", () => {
    const placed = TIMELINE.flatMap((era) => era.projects);
    expect(new Set(placed).size).toBe(placed.length);
    const expected = PROJECTS.filter((project) => project.slug !== ARCHIVE_SLUG).map((project) => project.slug);
    expect([...placed].sort()).toEqual([...expected].sort());
  });

  test("ранги только из шкалы CCG", () => {
    for (const project of PROJECTS) {
      if (project.rank !== null) expect(RANKS).toContain(project.rank);
    }
  });

  test("слаги уникальны, у каждого проекта есть ссылка", () => {
    const slugs = PROJECTS.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const project of PROJECTS) expect(project.links.length).toBeGreaterThan(0);
  });
});

test("у каждого диалога есть метаданные", () => {
  for (const id of DIALOG_IDS) expect(DIALOGS[id].id).toBe(id);
});

test("публикуется только разрешённый email владельца", () => {
  const everything = JSON.stringify({ OWNER, SELF_MESSAGES, STACK, PROJECTS, TIMELINE, DIALOGS });
  const emails = new Set(everything.match(/[\w.-]+@[\w-]+\.\w+/g) ?? []);
  expect([...emails]).toEqual(["chestor.official@gmail.com"]);
});
