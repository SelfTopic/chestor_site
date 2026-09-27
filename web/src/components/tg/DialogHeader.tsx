import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { UI } from "@/content/ui";

import { Avatar, type AvatarGlyph } from "./Avatar";
import styles from "./DialogHeader.module.css";

type DialogHeaderProps = {
  title: string;
  subtitle: ReactNode;
  glyph: AvatarGlyph;
  badge?: ReactNode;
  actions?: ReactNode;
  titleId?: string;
};

export function DialogHeader({ title, subtitle, glyph, badge, actions, titleId }: DialogHeaderProps) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.back} aria-label={UI.backToList}>
        <ArrowLeft size={22} />
      </Link>
      <Avatar glyph={glyph} size={40} />
      <div className={styles.titles}>
        <h1 className={styles.title} id={titleId}>
          {title}
          {badge}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.actions}>
        {actions}
        <span className={styles.mobileToggle}>
          <ThemeToggle />
        </span>
      </div>
    </header>
  );
}
