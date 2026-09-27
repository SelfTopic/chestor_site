import { ServiceMessage } from "@/components/tg/MessageBubble";
import { DIALOGS, type DialogId } from "@/content/dialogs";

import { ProjectsChannel } from "@/components/projects/ProjectsChannel";
import { SelfDialog } from "@/components/self/SelfDialog";

import { DialogScreen } from "./DialogScreen";
import { Thread } from "./Thread";

export function DialogById({ id }: { id: DialogId }) {
  if (id === "self") return <SelfDialog />;
  if (id === "projects") return <ProjectsChannel />;
  const dialog = DIALOGS[id];
  return (
    <DialogScreen dialog={dialog}>
      <Thread dialogId={id} label={dialog.title}>
        <ServiceMessage>{dialog.description}</ServiceMessage>
      </Thread>
    </DialogScreen>
  );
}
