import { ServiceMessage } from "@/components/tg/MessageBubble";
import { DIALOGS, type DialogId } from "@/content/dialogs";

import { BotDialog } from "@/components/botchat/BotDialog";
import { ProjectsChannel } from "@/components/projects/ProjectsChannel";
import { SelfrotChannel } from "@/components/selfrot/SelfrotChannel";
import { SelfDialog } from "@/components/self/SelfDialog";

import { DialogScreen } from "./DialogScreen";
import { Thread } from "./Thread";

export function DialogById({ id }: { id: DialogId }) {
  if (id === "self") return <SelfDialog />;
  if (id === "projects") return <ProjectsChannel />;
  if (id === "chestor_bot") return <BotDialog />;
  if (id === "selfrotgram") return <SelfrotChannel />;
  const dialog = DIALOGS[id];
  return (
    <DialogScreen dialog={dialog}>
      <Thread dialogId={id} label={dialog.title}>
        <ServiceMessage>{dialog.description}</ServiceMessage>
      </Thread>
    </DialogScreen>
  );
}
