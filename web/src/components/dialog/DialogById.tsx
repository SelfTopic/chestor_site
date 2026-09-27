import { ServiceMessage } from "@/components/tg/MessageBubble";
import { DIALOGS, type DialogId } from "@/content/dialogs";

import { DialogScreen } from "./DialogScreen";
import { Thread } from "./Thread";

export function DialogById({ id }: { id: DialogId }) {
  const dialog = DIALOGS[id];
  return (
    <DialogScreen dialog={dialog}>
      <Thread dialogId={id} label={dialog.title}>
        <ServiceMessage>{dialog.description}</ServiceMessage>
      </Thread>
    </DialogScreen>
  );
}
