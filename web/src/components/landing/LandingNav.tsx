import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

import styles from "./LandingNav.module.css";

type LandingNavProps = { back: { href: string; label: string } };

export function LandingNav({ back }: LandingNavProps) {
  return (
    <header className={styles.nav}>
      <Link href={back.href} className={styles.back}>
        <ArrowLeft size={18} aria-hidden="true" />
        {back.label}
      </Link>
      <nav className={styles.links} aria-label="Разделы">
        <Link href="/">CheStor</Link>
        <Link href="/bot">/bot</Link>
        <Link href="/selfrotgram">/selfrotgram</Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
