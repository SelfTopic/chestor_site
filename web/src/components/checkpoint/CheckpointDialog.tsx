import { DialogScreen } from "@/components/dialog/DialogScreen";
import { DIALOGS } from "@/content/dialogs";

import { Checkpoint } from "./Checkpoint";

export function CheckpointDialog() {
  return (
    <DialogScreen dialog={DIALOGS.checkpoint}>
      <Checkpoint />
    </DialogScreen>
  );
}
