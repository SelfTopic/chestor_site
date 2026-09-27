import { splitCode } from "@/lib/richText";

import styles from "./RichText.module.css";

export function RichText({ text }: { text: string }) {
  return (
    <>
      {splitCode(text).map((part, index) =>
        part.kind === "code" ? (
          <code key={index} className={styles.code}>
            {part.value}
          </code>
        ) : (
          part.value
        ),
      )}
    </>
  );
}
