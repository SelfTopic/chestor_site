import type { DialogId } from "@/content/dialogs";
import { AUTO_REPLIES } from "@/content/replies";

export type Reply = { text: string; delay: number; link?: { href: string; label: string } };

export function respond(dialogId: DialogId, text: string): Reply[] {
  void text;
  const auto = AUTO_REPLIES[dialogId];
  return auto ? [{ ...auto, delay: 900 }] : [];
}
