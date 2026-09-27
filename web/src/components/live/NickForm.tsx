"use client";

import { useState, type FormEvent } from "react";

import { LIVE_TEXT } from "@/content/live";
import { checkNick } from "@/lib/nick";

import styles from "./LiveChat.module.css";

type NickFormProps = { initial: string; min: number; max: number; onSave: (nick: string) => void };

export function NickForm({ initial, min, max, onSave }: NickFormProps) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = checkNick(value, min, max);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    onSave(result.nick);
  }

  return (
    <form className={styles.nickForm} onSubmit={submit}>
      <label className={styles.nickLabel}>
        {LIVE_TEXT.nickLabel}
        <input
          className={styles.nickInput}
          value={value}
          maxLength={max + 8}
          placeholder={LIVE_TEXT.nickPlaceholder}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "nick-error" : undefined}
        />
      </label>
      <button type="submit" className={styles.nickSave}>
        {LIVE_TEXT.nickSave}
      </button>
      {error ? (
        <p className={styles.nickError} id="nick-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
