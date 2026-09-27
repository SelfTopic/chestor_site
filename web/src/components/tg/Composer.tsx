"use client";

import { SendHorizontal } from "lucide-react";
import { useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";

import styles from "./Composer.module.css";

type ComposerProps = {
  onSend: (text: string) => void | boolean | Promise<void | boolean>;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  leading?: ReactNode;
  hint?: ReactNode;
  label?: string;
};

export function Composer({
  onSend,
  placeholder = "Сообщение",
  maxLength = 1000,
  disabled,
  leading,
  hint,
  label = "Сообщение",
}: ComposerProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const value = text.trim();
    if (!value || busy || disabled) return;
    setBusy(true);
    try {
      // false от обработчика — «не отправилось, оставь текст».
      const result = await onSend(value);
      if (result !== false) setText("");
    } finally {
      setBusy(false);
      input.current?.focus();
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }

  const rows = Math.min(5, text.split("\n").length);
  const left = maxLength - text.length;

  return (
    <form className={styles.composer} onSubmit={submit}>
      {hint ? <div className={styles.hint}>{hint}</div> : null}
      <div className={styles.row}>
        {leading}
        <label className={styles.field}>
          <span className="visually-hidden">{label}</span>
          <textarea
            ref={input}
            className={styles.input}
            value={text}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            enterKeyHint="send"
          />
          {left <= 50 ? (
            <span className={styles.counter} data-low={left <= 10 || undefined}>
              {left}
            </span>
          ) : null}
        </label>
        <button
          type="submit"
          className={styles.send}
          disabled={disabled || busy || !text.trim()}
          aria-label="Отправить"
        >
          <SendHorizontal size={22} />
        </button>
      </div>
    </form>
  );
}
