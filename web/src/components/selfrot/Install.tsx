"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { INSTALL } from "@/content/selfrotgram";

import styles from "./Selfrot.module.css";

export function Install() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <ul className={styles.install}>
      {INSTALL.map((command) => (
        <li key={command}>
          <code>
            <span className={styles.prompt}>$ </span>
            {command}
          </code>
          <button type="button" className={styles.copy} onClick={() => copy(command)} aria-label={`Скопировать: ${command}`}>
            {copied === command ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </li>
      ))}
    </ul>
  );
}
