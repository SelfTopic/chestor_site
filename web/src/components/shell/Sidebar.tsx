import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { DIALOG_ORDER, DIALOGS } from "@/content/dialogs";
import { UI } from "@/content/ui";

import { DialogList } from "./DialogList";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const dialogs = DIALOG_ORDER.map((id) => DIALOGS[id]);
  return (
    <>
      <div className={styles.top}>
        <ThemeToggle />
        <span className={styles.brand}>{UI.siteName}</span>
      </div>
      <DialogList dialogs={dialogs} />
      <p className={styles.hint}>{UI.eyeHint}</p>
      <p className={styles.footer}>{UI.footer}</p>
    </>
  );
}
