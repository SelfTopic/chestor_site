import type { Metadata } from "next";
import Link from "next/link";

import { NOT_FOUND } from "@/content/notFound";

import styles from "./not-found.module.css";

export const metadata: Metadata = { title: "404 — съедено", robots: { index: false } };

export default function NotFound() {
  return (
    <main className={styles.page}>
      <svg className={styles.page404} viewBox="0 0 200 240" aria-hidden="true">
        <path
          className={styles.sheet}
          d="M20 16h120l40 40v130c-8 4-12 14-20 16-10 2-12-10-22-10s-14 14-24 14-12-12-22-12-14 12-24 12-12-10-22-10c-8 0-10 8-16 6Z"
        />
        <path className={styles.fold} d="M140 16v40h40" />
        <path className={styles.line} d="M44 70h92M44 92h110M44 114h70M44 136h96" />
        <g className={styles.drops}>
          <path d="M60 206c0 5-3 8-6 8s-6-3-6-8c0-4 6-11 6-11s6 7 6 11Z" />
          <path d="M126 218c0 4-2 6-5 6s-5-2-5-6c0-3 5-9 5-9s5 6 5 9Z" />
        </g>
      </svg>
      <p className={styles.code}>{NOT_FOUND.code}</p>
      <h1 className={styles.title}>{NOT_FOUND.title}</h1>
      <p className={styles.text}>{NOT_FOUND.text}</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primary}>
          {NOT_FOUND.home}
        </Link>
        <Link href="/c/live" className={styles.secondary}>
          {NOT_FOUND.live}
        </Link>
      </div>
    </main>
  );
}
