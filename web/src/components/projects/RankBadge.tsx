import { RANK_TITLES, type Rank } from "@/content/projects";

import styles from "./RankBadge.module.css";

export function RankBadge({ rank }: { rank: Rank }) {
  return (
    <span className={styles.badge} data-rank={rank} title={`Ранг ${rank}: ${RANK_TITLES[rank]}`}>
      <span className={styles.label}>ранг</span>
      <span className={styles.rank}>{rank}</span>
    </span>
  );
}
