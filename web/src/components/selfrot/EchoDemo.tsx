"use client";

import { useState } from "react";

import { CodeBlock } from "@/components/code/CodeBlock";
import { ECHO_BROKEN_CODE, ECHO_CODE, ECHO_ERROR } from "@/content/selfrotgram";

import styles from "./Selfrot.module.css";

export function EchoDemo() {
  const [broken, setBroken] = useState(false);
  return (
    <div className={styles.echo}>
      <div className={styles.echoBar}>
        <span className={styles.file}>echo_bot.py</span>
        <button type="button" className={styles.toggle} aria-pressed={broken} onClick={() => setBroken((value) => !value)}>
          {broken ? "Вернуть HasText()" : "Забыть HasText()"}
        </button>
      </div>
      <CodeBlock code={broken ? ECHO_BROKEN_CODE : ECHO_CODE} tone={broken ? "bad" : "good"} />
      <p className={styles.echoResult} data-broken={broken || undefined} role="status">
        {broken ? (
          <>
            <span className={styles.echoPrompt}>$ python -m bot</span>
            {"\n"}
            {ECHO_ERROR}
          </>
        ) : (
          <>
            <span className={styles.echoPrompt}>$ python -m bot</span>
            {"\n"}Запущен @echo_bot, жду апдейты (long polling)
          </>
        )}
      </p>
    </div>
  );
}
