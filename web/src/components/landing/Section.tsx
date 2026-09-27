import type { ReactNode } from "react";

import styles from "./Section.module.css";

type SectionProps = { id: string; kicker: string; title: string; lead?: ReactNode; children: ReactNode };

export function Section({ id, kicker, title, lead, children }: SectionProps) {
  return (
    <section className={styles.section} id={id} aria-labelledby={`${id}-title`}>
      <p className={styles.kicker}>{kicker}</p>
      <h2 className={styles.title} id={`${id}-title`}>
        {title}
      </h2>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}
