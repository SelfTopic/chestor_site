"use client";

import { useCallback, useEffect, useState } from "react";

import { errorText, LIVE_TEXT } from "@/content/live";
import { type Challenge, chatApi, ChatApiError } from "@/lib/chatApi";
import { setPassExpiresAt } from "@/lib/liveStore";

import styles from "./LiveChat.module.css";

export function CaptchaPanel({ onPassed }: { onPassed: (expiresAt: number) => void }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setChallenge(await chatApi.captcha());
    } catch (error) {
      const failure = error instanceof ChatApiError ? error : new ChatApiError("network", "");
      setNote(errorText(failure.code, failure.message, failure.retryAfter));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    // Вопрос берётся при открытии панели: запрос к внешнему API, а не вычисление из состояния.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function answer(option: string) {
    if (!challenge || busy) return;
    setBusy(true);
    try {
      const verdict = await chatApi.answer(challenge.challenge_id, option);
      if (verdict.correct && verdict.pass_expires_at) {
        setPassExpiresAt(verdict.pass_expires_at);
        onPassed(verdict.pass_expires_at);
        return;
      }
      setNote(LIVE_TEXT.captchaWrong.replace("{answer}", verdict.answer));
      setChallenge(await chatApi.captcha());
    } catch (error) {
      const failure = error instanceof ChatApiError ? error : new ChatApiError("network", "");
      setNote(errorText(failure.code, failure.message, failure.retryAfter));
      if (failure.code === "challenge_expired") setChallenge(await chatApi.captcha().catch(() => null));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.captcha} aria-busy={busy}>
      <p className={styles.captchaTitle}>{LIVE_TEXT.needPass}</p>
      {challenge ? (
        <>
          <p className={styles.question}>{challenge.question}</p>
          <div className={styles.options}>
            {challenge.options.map((option) => (
              <button key={option} type="button" className={styles.option} disabled={busy} onClick={() => answer(option)}>
                {option}
              </button>
            ))}
          </div>
          {challenge.source === "fixture" ? <p className={styles.fixture}>{LIVE_TEXT.captchaFixture}</p> : null}
        </>
      ) : null}
      {note ? (
        <p className={styles.captchaNote} role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}
