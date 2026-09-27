import { LIFE_CYCLE } from "@/content/bot";

import styles from "./LifeCycle.module.css";

const RADIUS = 110;
const CENTER = 150;

export function LifeCycle() {
  const points = LIFE_CYCLE.map((_, index) => {
    const angle = (index / LIFE_CYCLE.length) * Math.PI * 2 - Math.PI / 2;
    return [CENTER + RADIUS * Math.cos(angle), CENTER + RADIUS * Math.sin(angle)] as const;
  });
  return (
    <figure className={styles.figure}>
      <svg viewBox="-10 -10 320 320" className={styles.svg} role="img" aria-label={`Игровой цикл: ${LIFE_CYCLE.join(" → ")} → снова голод`}>
        <circle cx={CENTER} cy={CENTER} r={RADIUS} className={styles.ring} />
        <circle cx={CENTER} cy={CENTER} r={RADIUS} className={styles.pulse} />
        {points.map(([x, y], index) => (
          <g key={LIFE_CYCLE[index]}>
            <circle cx={x} cy={y} r="36" className={styles.node} />
            <text x={x} y={y + 4} className={styles.label}>
              {LIFE_CYCLE[index]}
            </text>
          </g>
        ))}
        <text x={CENTER} y={CENTER - 6} className={styles.center}>
          1.0.0
        </text>
        <text x={CENTER} y={CENTER + 14} className={styles.centerCaption}>
          цикл закрыт
        </text>
      </svg>
    </figure>
  );
}
