"use client";

import { useState } from "react";

import { CodeBlock } from "@/components/code/CodeBlock";
import { PAIRS } from "@/content/selfrotgram";

import styles from "./Selfrot.module.css";

export function Pairs() {
  const [active, setActive] = useState(0);
  const pair = PAIRS[active]!;
  return (
    <div className={styles.pairs}>
      <div className={styles.tabs} role="tablist" aria-label="Задачи">
        {PAIRS.map((item, index) => (
          <button
            key={item.title}
            type="button"
            role="tab"
            id={`pair-tab-${index}`}
            aria-selected={active === index}
            aria-controls="pair-panel"
            className={styles.tab}
            onClick={() => setActive(index)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className={styles.pairPanel} role="tabpanel" id="pair-panel" aria-labelledby={`pair-tab-${active}`}>
        <CodeBlock code={pair.aiogram} label="было · aiogram 3" tone="bad" />
        <CodeBlock code={pair.selfrot} label="стало · selfrotgram" tone="good" />
      </div>
      <p className={styles.pairNote}>{pair.note}</p>
    </div>
  );
}
