import { expect, test } from "vitest";

import { fetchRecentCommits, firstLine, parseCommits, pickRecent } from "./github";

const apiCommit = (message: string, date: string) => ({
  html_url: `https://github.com/SelfTopic/x/commit/${date}`,
  commit: { message, author: { date } },
});

test("первая строка сообщения и обрезка", () => {
  expect(firstLine("feat: x\n\nCo-Authored-By: ...")).toBe("feat: x");
  expect(firstLine("a".repeat(120))).toHaveLength(90);
});

test("парсинг пропускает мерджи и мусор", () => {
  const parsed = parseCommits("chestor_bot", [
    apiCommit("fix: голод", "2026-09-20T10:00:00Z"),
    apiCommit("Merge branch 'main'", "2026-09-21T10:00:00Z"),
    { html_url: 1 },
  ]);
  expect(parsed).toEqual([
    { repo: "chestor_bot", message: "fix: голод", date: "2026-09-20T10:00:00Z", url: "https://github.com/SelfTopic/x/commit/2026-09-20T10:00:00Z" },
  ]);
  expect(parseCommits("x", { message: "Not Found" })).toEqual([]);
});

test("свежие сверху и не больше лимита", () => {
  const commits = ["2026-09-01", "2026-09-03", "2026-09-02"].map((date) => ({ repo: "r", message: date, date, url: date }));
  expect(pickRecent(commits, 2).map((commit) => commit.date)).toEqual(["2026-09-03", "2026-09-02"]);
});

test("сбой сети не ломает сборку", async () => {
  const failing = (() => Promise.reject(new Error("offline"))) as unknown as typeof fetch;
  expect(await fetchRecentCommits("SelfTopic", ["a", "b"], 5, failing)).toEqual([]);
});

test("ответы нескольких репозиториев сливаются", async () => {
  const fake = (async (url: string) =>
    new Response(JSON.stringify([apiCommit(`коммит ${url.includes("/a/") ? "a" : "b"}`, url.includes("/a/") ? "2026-09-02" : "2026-09-01")]))) as unknown as typeof fetch;
  const commits = await fetchRecentCommits("SelfTopic", ["a", "b"], 5, fake);
  expect(commits.map((commit) => commit.repo)).toEqual(["a", "b"]);
});
