import { ChevronDown } from "lucide-react";

import { ChannelPost } from "@/components/tg/ChannelPost";
import { RichText } from "@/components/tg/RichText";
import type { Project } from "@/content/projects";

import styles from "./ProjectPost.module.css";
import { RankBadge } from "./RankBadge";

export function ProjectPost({ project }: { project: Project }) {
  return (
    <div className={styles.wrap} data-rank={project.rank ?? "none"}>
      <ChannelPost
        id={project.slug}
        channel="Проекты"
        glyph="projects"
        time={project.dated || undefined}
        badge={project.rank ? <RankBadge rank={project.rank} /> : <span className={styles.archive}>архив</span>}
        footer={
          <span className={styles.links}>
            {project.links.map((link) => (
              <a key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </a>
            ))}
          </span>
        }
      >
        <h2 className={styles.title}>
          {project.title} <span className={styles.lang}>{project.lang}</span>
        </h2>
        <p className={styles.tagline}>{project.tagline}</p>
        <p>
          <RichText text={project.summary} />
        </p>
        {project.facts ? (
          <dl className={styles.facts}>
            {project.facts.map((fact) => (
              <div key={fact.label} className={styles.fact}>
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <details className={styles.details}>
          <summary className={styles.summary}>
            Подробнее <ChevronDown size={16} aria-hidden="true" className={styles.chevron} />
          </summary>
          <ul className={styles.bullets}>
            {project.details.map((line) => (
              <li key={line}>
                <RichText text={line} />
              </li>
            ))}
          </ul>
          {project.note ? <p className={styles.note}>{project.note}</p> : null}
          <p className={styles.stack}>
            {project.stack.map((item) => (
              <span key={item} className={styles.chip}>
                {item}
              </span>
            ))}
          </p>
        </details>
      </ChannelPost>
    </div>
  );
}
