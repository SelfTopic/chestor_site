import Image from "next/image";

import { type LiveMedia, mediaUrl } from "@/lib/chatApi";

import styles from "./LiveChat.module.css";

const MAX = { photo: 320, sticker: 160 } as const;

export function LiveImage({ media }: { media: LiveMedia }) {
  const max = MAX[media.kind];
  const scale = Math.min(1, max / Math.max(media.width, media.height, 1));
  return (
    <Image
      // Картинки отдаёт свой бэкенд с кэшем; оптимизатор Next тут только лишний прокси.
      unoptimized
      src={mediaUrl(media)}
      width={Math.round(media.width * scale)}
      height={Math.round(media.height * scale)}
      alt={media.kind === "photo" ? "фото из Telegram-группы" : "стикер"}
      className={styles.media}
      data-kind={media.kind}
      loading="lazy"
    />
  );
}
