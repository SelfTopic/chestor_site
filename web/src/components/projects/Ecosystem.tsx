import { ECO_EDGES, ECO_NARROW, ECO_NODES, ECO_WIDE, type EcoLayout } from "@/content/ecosystem";
import { borderPoint } from "@/lib/geometry";

import styles from "./Ecosystem.module.css";

const GAP = 6;

function Diagram({ layout, className, markerId }: { layout: EcoLayout; className?: string; markerId: string }) {
  const { w, h } = layout.node;
  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={`${styles.svg} ${className}`}
      role="group"
      aria-label="Схема экосистемы: selfrotgram и ghoul-quiz-lib питают chestor_bot и этот сайт, ghoul-quiz-lib ходит в Ghoul API, userbot-api проверяет chestor_bot"
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10Z" className={styles.arrowHead} />
        </marker>
      </defs>
      {ECO_EDGES.map((edge) => {
        const a = layout.at[edge.from];
        const b = layout.at[edge.to];
        const [x1, y1] = borderPoint(a, w + GAP, h + GAP, b);
        const [x2, y2] = borderPoint(b, w + GAP * 2, h + GAP * 2, a);
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} className={styles.edge} markerEnd={`url(#${markerId})`} />
            {edge.label ? (
              <text x={(x1 + x2) / 2 + 8} y={(y1 + y2) / 2 + 4} className={styles.edgeLabel}>
                {edge.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {ECO_NODES.map((node) => {
        const [cx, cy] = layout.at[node.id];
        const box = (
          <g className={styles.node} data-accent={node.accent || undefined}>
            <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="12" />
            <text x={cx} y={cy - 3} className={styles.title}>
              {node.title}
            </text>
            <text x={cx} y={cy + 15} className={styles.nodeCaption}>
              {node.caption}
            </text>
          </g>
        );
        return node.href ? (
          <a key={node.id} href={node.href} className={styles.link}>
            {box}
          </a>
        ) : (
          <g key={node.id}>{box}</g>
        );
      })}
    </svg>
  );
}

export function Ecosystem() {
  return (
    <figure className={styles.figure}>
      <Diagram layout={ECO_WIDE} className={styles.wide} markerId="eco-arrow-wide" />
      <Diagram layout={ECO_NARROW} className={styles.narrow} markerId="eco-arrow-narrow" />
      <figcaption className={styles.note}>Стрелка — «используется в». Узлы кликабельны.</figcaption>
    </figure>
  );
}
