import type { Era } from "@/content/projects";

import styles from "./EraMarker.module.css";

export function EraMarker({ era }: { era: Era }) {
  return (
    <div className={styles.era} id={`era-${era.id}`}>
      <span className={styles.label}>{era.label}</span>
      <p className={styles.text}>{era.text}</p>
    </div>
  );
}
