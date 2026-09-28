// «Сейчас в работе»: последние коммиты публичных репозиториев; страница перегенерируется раз в час (ISR).
export type RecentCommit = { repo: string; message: string; date: string; url: string };

type ApiCommit = {
  html_url?: unknown;
  commit?: { message?: unknown; author?: { date?: unknown } | null } | null;
};

const MESSAGE_MAX = 90;
const COMMITS_REVALIDATE_SECONDS = 3600;

export function firstLine(message: string): string {
  const line = message.split("\n")[0]?.trim() ?? "";
  return line.length > MESSAGE_MAX ? `${line.slice(0, MESSAGE_MAX - 1)}…` : line;
}

export function parseCommits(repo: string, payload: unknown): RecentCommit[] {
  if (!Array.isArray(payload)) return [];
  return payload.flatMap((item: ApiCommit) => {
    const message = item.commit?.message;
    const date = item.commit?.author?.date;
    const url = item.html_url;
    if (typeof message !== "string" || typeof date !== "string" || typeof url !== "string") return [];
    if (message.startsWith("Merge ")) return [];
    return [{ repo, message: firstLine(message), date, url }];
  });
}

export function pickRecent(commits: RecentCommit[], limit: number): RecentCommit[] {
  return [...commits].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

export async function fetchRecentCommits(
  owner: string,
  repos: readonly string[],
  limit = 6,
  fetchImpl: typeof fetch = fetch,
): Promise<RecentCommit[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  // Токен (если задан) нужен только для лимита API при сборке и в браузер не попадает.
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const lists = await Promise.all(
    repos.map(async (repo) => {
      try {
        const response = await fetchImpl(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`, {
          headers,
          next: { revalidate: COMMITS_REVALIDATE_SECONDS },
          signal: AbortSignal.timeout(5000),
        });
        return response.ok ? parseCommits(repo, await response.json()) : [];
      } catch {
        return [];
      }
    }),
  );
  return pickRecent(lists.flat(), limit);
}
