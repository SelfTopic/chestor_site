import { BotDialog } from "@/components/botchat/BotDialog";
import { CheckpointDialog } from "@/components/checkpoint/CheckpointDialog";
import { LiveDialog } from "@/components/live/LiveDialog";
import { ProjectsChannel } from "@/components/projects/ProjectsChannel";
import { SelfDialog } from "@/components/self/SelfDialog";
import { SelfrotChannel } from "@/components/selfrot/SelfrotChannel";
import type { DialogId } from "@/content/dialogs";

export function DialogById({ id }: { id: DialogId }) {
  switch (id) {
    case "self":
      return <SelfDialog />;
    case "live":
      return <LiveDialog />;
    case "projects":
      return <ProjectsChannel />;
    case "checkpoint":
      return <CheckpointDialog />;
    case "chestor_bot":
      return <BotDialog />;
    case "selfrotgram":
      return <SelfrotChannel />;
  }
}
