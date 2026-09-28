"use client";

import { useEffect, useRef, useState } from "react";

import { TERMINAL_SESSIONS } from "@/content/selfrotgram";
import { useReducedMotion } from "@/lib/useReducedMotion";

import styles from "./Selfrot.module.css";

type Phase = { session: number; typed: number; lines: number };

const TYPE_MS = 55;
const LINE_MS = 90;
const PAUSE_MS = 2600;

function lineKind(line: string): "error" | "warn" | "plain" {
  if (line.startsWith("ошибка") || line.includes("! недостижим")) return "error";
  if (line.startsWith("предупреждение")) return "warn";
  return "plain";
}

export function Terminal() {
  const [phase, setPhase] = useState<Phase>({ session: 0, typed: 0, lines: 0 });
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const session = TERMINAL_SESSIONS[phase.session]!;
  const output = session.output.split("\n");

  useEffect(() => {
    if (!visible || reduced) return;
    let delay = TYPE_MS;
    let next: Phase;
    if (phase.typed < session.command.length) {
      next = { ...phase, typed: phase.typed + 1 };
    } else if (phase.lines < output.length) {
      delay = phase.lines === 0 ? 400 : LINE_MS;
      next = { ...phase, lines: phase.lines + 1 };
    } else {
      delay = PAUSE_MS;
      next = { session: (phase.session + 1) % TERMINAL_SESSIONS.length, typed: 0, lines: 0 };
    }
    const timer = window.setTimeout(() => setPhase(next), delay);
    return () => window.clearTimeout(timer);
  }, [phase, visible, reduced, session.command.length, output.length]);

  const typed = reduced ? session.command : session.command.slice(0, phase.typed);
  const shown = reduced ? output : output.slice(0, phase.lines);

  return (
    <div className={styles.terminal} ref={root}>
      <div className={styles.terminalBar}>
        <span className={styles.lights} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className={styles.terminalTabs} role="tablist" aria-label="Команды">
          {TERMINAL_SESSIONS.map((item, index) => (
            <button
              key={item.command}
              type="button"
              role="tab"
              aria-selected={phase.session === index}
              className={styles.terminalTab}
              onClick={() => setPhase({ session: index, typed: 0, lines: 0 })}
            >
              {item.command}
            </button>
          ))}
        </div>
      </div>
      <pre className={styles.terminalBody} aria-live="off">
        <span className={styles.prompt}>$ </span>
        {typed}
        {phase.typed < session.command.length && !reduced ? <span className={styles.cursor} aria-hidden="true" /> : null}
        {shown.map((line, index) => (
          <span key={index} className={styles.line} data-kind={lineKind(line)}>
            {"\n"}
            {line}
          </span>
        ))}
        {shown.length === output.length && !reduced ? (
          <>
            {"\n"}
            <span className={styles.prompt}>$ </span>
            <span className={styles.cursor} aria-hidden="true" />
          </>
        ) : null}
      </pre>
      <p className="visually-hidden">{`$ ${session.command}\n${session.output}`}</p>
    </div>
  );
}
