import type { ReactNode } from "react";

import { DialogHeader } from "@/components/tg/DialogHeader";
import wallpaper from "@/components/tg/Wallpaper.module.css";
import type { DialogMeta } from "@/content/dialogs";

import styles from "./DialogScreen.module.css";

type DialogScreenProps = {
  dialog: DialogMeta;
  subtitle?: ReactNode;
  children: ReactNode;
};

export function DialogScreen({ dialog, subtitle, children }: DialogScreenProps) {
  return (
    <section className={`${styles.screen} ${wallpaper.wallpaper}`} aria-labelledby={`dialog-${dialog.id}`}>
      <DialogHeader title={dialog.title} subtitle={subtitle ?? dialog.subtitle} glyph={dialog.glyph} titleId={`dialog-${dialog.id}`} />
      {children}
    </section>
  );
}
