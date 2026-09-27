"use client";

import { useState, type ReactNode } from "react";

import { RANKS, type Rank } from "@/content/projects";

import styles from "./RankFilter.module.css";

type Filter = Rank | "all";

export function RankFilter({ counts, children }: { counts: Record<Rank, number>; children: ReactNode }) {
  const [filter, setFilter] = useState<Filter>("all");
  const options: Filter[] = ["all", ...RANKS.filter((rank) => counts[rank] > 0)];
  return (
    <>
      <div className={styles.bar} role="toolbar" aria-label="Фильтр по рангу угрозы">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.chip}
            data-rank={option}
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
          >
            {option === "all" ? "Все" : option}
            {option !== "all" ? <span className={styles.count}>{counts[option]}</span> : null}
          </button>
        ))}
      </div>
      <div className={styles.feed} data-filter={filter}>
        {children}
      </div>
    </>
  );
}
