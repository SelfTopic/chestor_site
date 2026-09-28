import type { LiveMessage } from "./chatApi";

export type LiveRow = {
  message: LiveMessage;
  day: string | null;
  mine: boolean;
  showAuthor: boolean;
  lastInGroup: boolean;
};

const speaker = (message: LiveMessage) => `${message.source}:${message.author}`;

// Как в группах Telegram: имя над первым сообщением серии, аватар у последнего, дата — при смене дня.
export function layoutMessages(
  messages: LiveMessage[],
  own: Set<string>,
  dayOf: (ts: number) => string,
): LiveRow[] {
  return messages.map((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const day = dayOf(message.ts);
    const newDay = !previous || dayOf(previous.ts) !== day;
    const mine = message.client_id !== null && own.has(message.client_id);
    return {
      message,
      day: newDay ? day : null,
      mine,
      showAuthor: !mine && (newDay || !previous || speaker(previous) !== speaker(message)),
      lastInGroup: !next || speaker(next) !== speaker(message) || dayOf(next.ts) !== day,
    };
  });
}
