import { DialogScreen } from "@/components/dialog/DialogScreen";
import { DIALOGS } from "@/content/dialogs";

import { LiveChat } from "./LiveChat";
import { LiveSubtitle } from "./LiveSubtitle";

export function LiveDialog() {
  return (
    <DialogScreen dialog={DIALOGS.live} subtitle={<LiveSubtitle />}>
      <LiveChat />
    </DialogScreen>
  );
}
