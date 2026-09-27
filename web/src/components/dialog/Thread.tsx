"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { ChatArea } from "@/components/tg/ChatArea";
import { Composer } from "@/components/tg/Composer";
import { MessageBubble } from "@/components/tg/MessageBubble";
import type { DialogId } from "@/content/dialogs";
import { respond, type Reply } from "@/lib/responders";
import { formatTime } from "@/lib/time";

import styles from "./Thread.module.css";

type LocalMessage = {
  id: number;
  direction: "in" | "out";
  text: string;
  time: string;
  link?: Reply["link"];
};

type ThreadProps = {
  dialogId: DialogId;
  label: string;
  startAt?: "top" | "bottom";
  placeholder?: string;
  children: ReactNode;
};

export function Thread({ dialogId, label, startAt = "bottom", placeholder, children }: ThreadProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [awake, setAwake] = useState(false);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroller = root.current?.querySelector<HTMLElement>("[role=log]");
    if (scroller && startAt === "bottom") scroller.scrollTop = scroller.scrollHeight;
  }, [startAt]);

  useEffect(() => {
    if (messages.length === 0 && !typing) return;
    const scroller = root.current?.querySelector<HTMLElement>("[role=log]");
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function push(message: Omit<LocalMessage, "id" | "time">) {
    const id = nextId.current++;
    setMessages((previous) => [...previous, { ...message, id, time: formatTime(new Date()) }]);
  }

  function send(text: string) {
    push({ direction: "out", text });
    const replies = respond(dialogId, text);
    let elapsed = 0;
    replies.forEach((reply, index) => {
      elapsed += reply.delay;
      if (index === 0) setTyping(true);
      const timer = window.setTimeout(() => {
        push({ direction: "in", text: reply.text, link: reply.link });
        if (reply.effect === "awaken") {
          setAwake(true);
          timers.current.push(window.setTimeout(() => setAwake(false), 1400));
        }
        if (index === replies.length - 1) setTyping(false);
      }, elapsed);
      timers.current.push(timer);
    });
  }

  return (
    <div className={styles.thread} ref={root} data-awake={awake || undefined}>
      <ChatArea label={label}>
        {children}
        {messages.map((message) => (
          <MessageBubble key={message.id} direction={message.direction} time={message.time} read={message.direction === "out" ? true : undefined}>
            {message.text}
            {message.link ? (
              <>
                {"\n"}
                <Link href={message.link.href} className={styles.link}>
                  {message.link.label}
                </Link>
              </>
            ) : null}
          </MessageBubble>
        ))}
        {typing ? <p className={styles.typing}>печатает…</p> : null}
      </ChatArea>
      <Composer onSend={send} placeholder={placeholder} />
    </div>
  );
}
