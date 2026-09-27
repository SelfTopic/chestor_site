import { MessageBubble } from "@/components/tg/MessageBubble";
import { ACTIVE_REPOS, SELF_MESSAGES } from "@/content/owner";
import { fetchRecentCommits } from "@/lib/github";

import styles from "./SelfDialog.module.css";

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", timeZone: "UTC" });
}

export async function NowWorking() {
  const commits = await fetchRecentCommits("SelfTopic", ACTIVE_REPOS);
  if (commits.length === 0) return null;
  return (
    <MessageBubble direction="in" wide>
      <span className={styles.stackIntro}>{SELF_MESSAGES.now}</span>
      <span className={styles.commits}>
        {commits.map((commit) => (
          <a key={commit.url} href={commit.url} className={styles.commit}>
            <span className={styles.commitRepo}>{commit.repo}</span>
            <span className={styles.commitMessage}>{commit.message}</span>
            <time className={styles.commitDate} dateTime={commit.date}>
              {shortDate(commit.date)}
            </time>
          </a>
        ))}
      </span>
    </MessageBubble>
  );
}
