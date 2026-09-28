import { highlightPython } from "@/lib/highlight";

import styles from "./CodeBlock.module.css";

type CodeBlockProps = { code: string; label?: string; tone?: "neutral" | "bad" | "good" };

export function CodeBlock({ code, label, tone = "neutral" }: CodeBlockProps) {
  return (
    <figure className={styles.block} data-tone={tone}>
      {label ? <figcaption className={styles.label}>{label}</figcaption> : null}
      <pre className={styles.pre} tabIndex={0}>
        <code>
          {highlightPython(code).map((token, index) =>
            token.kind === "text" ? (
              token.value
            ) : (
              <span key={index} className={styles[token.kind]}>
                {token.value}
              </span>
            ),
          )}
        </code>
      </pre>
    </figure>
  );
}
