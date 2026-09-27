"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Composer } from "@/components/tg/Composer";
import { MessageBubble, ServiceMessage } from "@/components/tg/MessageBubble";
import { CHECKPOINT_TEXT, errorText } from "@/content/live";
import { type Challenge, chatApi, ChatApiError } from "@/lib/chatApi";
import { isThousandMinusSeven, thousandMinusSeven } from "@/lib/easterEggs";
import { setPassExpiresAt, useLive } from "@/lib/liveStore";
import { applyAnswer, EMPTY_SCORE, pickOption, type Score } from "@/lib/quizScore";
import { formatTime } from "@/lib/time";

import styles from "./Checkpoint.module.css";

type Line =
  | { id: number; kind: "bot"; text: string; live?: boolean }
  | { id: number; kind: "user"; text: string }
  | { id: number; kind: "question"; challenge: Challenge; answered: boolean }
  | { id: number; kind: "next" };

type NewLine = Line extends infer Item ? (Item extends Line ? Omit<Item, "id"> : never) : never;

const BEST_KEY = "chestor-quiz-best";

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export function Checkpoint() {
  const live = useLive();
  const [lines, setLines] = useState<Line[]>([]);
  const [score, setScore] = useState<Score>(() => ({
    ...EMPTY_SCORE,
    best: typeof window === "undefined" ? 0 : readBest(),
  }));
  const [busy, setBusy] = useState(false);
  const nextId = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const passGiven = useRef(false);

  useEffect(() => {
    const node = scroller.current;
    node?.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    try {
      localStorage.setItem(BEST_KEY, String(score.best));
    } catch {
      // Рекорд просто не переживёт перезагрузку.
    }
  }, [score.best]);

  const push = (...items: NewLine[]) =>
    setLines((previous) => [...previous, ...items.map((item) => ({ ...item, id: nextId.current++ }) as Line)]);

  const current = [...lines].reverse().find((line) => line.kind === "question" && !line.answered) as
    | Extract<Line, { kind: "question" }>
    | undefined;

  async function ask() {
    if (busy) return;
    setBusy(true);
    setLines((previous) => previous.filter((line) => line.kind !== "next"));
    try {
      const challenge = await chatApi.captcha();
      push({ kind: "question", challenge, answered: false });
    } catch (error) {
      const failure = error instanceof ChatApiError ? error : new ChatApiError("network", "");
      push({
        kind: "bot",
        text: CHECKPOINT_TEXT.closed.replace("{reason}", errorText(failure.code, failure.message, failure.retryAfter)),
      });
      push({ kind: "next" });
    } finally {
      setBusy(false);
    }
  }

  async function answer(question: Extract<Line, { kind: "question" }>, option: string) {
    if (busy || question.answered) return;
    setBusy(true);
    setLines((previous) => previous.map((line) => (line.id === question.id ? { ...question, answered: true } : line)));
    push({ kind: "user", text: option });
    try {
      const verdict = await chatApi.answer(question.challenge.challenge_id, option);
      setScore((previous) => applyAnswer(previous, verdict.correct));
      if (verdict.correct) {
        const praise = CHECKPOINT_TEXT.correct[score.score % CHECKPOINT_TEXT.correct.length]!;
        push({ kind: "bot", text: `✅ ${praise}` });
        if (verdict.pass_expires_at && !passGiven.current) {
          passGiven.current = true;
          setPassExpiresAt(verdict.pass_expires_at);
          push({
            kind: "bot",
            text: `🎫 ${CHECKPOINT_TEXT.pass.replace("{time}", formatTime(new Date(verdict.pass_expires_at * 1000)))}`,
            live: true,
          });
        }
      } else {
        push({ kind: "bot", text: `❌ ${CHECKPOINT_TEXT.wrong.replace("{answer}", verdict.answer)}` });
      }
    } catch (error) {
      const failure = error instanceof ChatApiError ? error : new ChatApiError("network", "");
      push({ kind: "bot", text: errorText(failure.code, failure.message, failure.retryAfter) });
    } finally {
      setBusy(false);
      push({ kind: "next" });
    }
  }

  function onText(text: string) {
    if (isThousandMinusSeven(text)) {
      push({ kind: "user", text });
      let elapsed = 0;
      for (const reply of thousandMinusSeven()) {
        elapsed += reply.delay;
        window.setTimeout(() => push({ kind: "bot", text: reply.text }), elapsed);
      }
      return;
    }
    push({ kind: "user", text });
    if (text.trim().toLowerCase().startsWith("/start")) {
      void ask();
      return;
    }
    if (current) {
      const option = pickOption(text, current.challenge.options);
      if (option) {
        setLines((previous) => previous.filter((line) => !(line.kind === "user" && line.text === text)));
        void answer(current, option);
        return;
      }
    }
    push({ kind: "bot", text: CHECKPOINT_TEXT.useButtons });
  }

  return (
    <div className={styles.checkpoint}>
      <p className={styles.score} aria-live="polite">
        {CHECKPOINT_TEXT.score
          .replace("{score}", String(score.score))
          .replace("{streak}", String(score.streak))
          .replace("{best}", String(score.best))}
      </p>
      <div className={styles.scroll} ref={scroller} role="log" aria-label="Диалог с CCG Checkpoint" tabIndex={0}>
        <div className={styles.column}>
          <div className={styles.intro}>
            <p>{CHECKPOINT_TEXT.intro}</p>
            {live.captcha === "fixture" ? <p className={styles.fixture}>{CHECKPOINT_TEXT.fixture}</p> : null}
            {lines.length === 0 ? (
              <button type="button" className={styles.start} onClick={ask} disabled={busy}>
                {CHECKPOINT_TEXT.start}
              </button>
            ) : null}
          </div>
          {lines.map((line) => {
            switch (line.kind) {
              case "user":
                return (
                  <MessageBubble key={line.id} direction="out">
                    {line.text}
                  </MessageBubble>
                );
              case "bot":
                return (
                  <div key={line.id} className={styles.botLine}>
                    <MessageBubble direction="in">{line.text}</MessageBubble>
                    {line.live ? (
                      <Link href="/c/live" className={styles.key}>
                        {CHECKPOINT_TEXT.openLive}
                      </Link>
                    ) : null}
                  </div>
                );
              case "question":
                return (
                  <div key={line.id} className={styles.botLine}>
                    <MessageBubble direction="in">{line.challenge.question}</MessageBubble>
                    <div className={styles.keyboard}>
                      {line.challenge.options.map((option, index) => (
                        <button
                          key={option}
                          type="button"
                          className={styles.key}
                          disabled={line.answered || busy}
                          onClick={() => answer(line, option)}
                        >
                          <span className={styles.keyNo}>{index + 1}</span> {option}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              case "next":
                return (
                  <button key={line.id} type="button" className={`${styles.key} ${styles.nextKey}`} onClick={ask} disabled={busy}>
                    {CHECKPOINT_TEXT.next}
                  </button>
                );
            }
          })}
          {busy ? <ServiceMessage>{CHECKPOINT_TEXT.loading}</ServiceMessage> : null}
        </div>
      </div>
      <Composer onSend={onText} placeholder="Ответ, номер варианта или /start" />
    </div>
  );
}
