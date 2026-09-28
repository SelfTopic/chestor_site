import { OG_SIZE, ogImage } from "@/og/card";

export const alt = "chestor_bot — досье CCG";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    kicker: "CCG · ДЕЛО № SSS-001",
    title: "chestor_bot",
    subtitle: "RPG-бот по «Токийскому гулю»: голод, кагуне, бои и экономика. Версия 1.0.0.",
    tag: "РАНГ SSS",
  });
}
