"use client";

import { ArrowDown, Pencil, TriangleAlert } from "lucide-react";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Avatar } from "@/components/tg/Avatar";
import { Composer } from "@/components/tg/Composer";
import { MessageBubble, ServiceMessage } from "@/components/tg/MessageBubble";
import { errorText, LIVE_TEXT } from "@/content/live";
import { chatApi, ChatApiError, newClientId, type PendingMessage, settlePending } from "@/lib/chatApi";
import { isThousandMinusSeven, thousandMinusSeven } from "@/lib/easterEggs";
import { layoutMessages } from "@/lib/liveLayout";
import { sendTyping, setPassExpiresAt, useLive } from "@/lib/liveStore";
import { ownClientIds, rememberOwn } from "@/lib/ownMessages";
import { formatTime } from "@/lib/time";
import { useStoredNick } from "@/lib/useStoredNick";

import { CaptchaPanel } from "./CaptchaPanel";
import styles from "./LiveChat.module.css";
import { NickForm } from "./NickForm";

type LocalLine = { id: number; text: string; out: boolean };
type Panel = "none" | "nick" | "captcha";

const NEAR_BOTTOM_PX = 120;

function dayLabel(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export function LiveChat() {
  const live = useLive();
  const [nick, setNick] = useStoredNick();
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [local, setLocal] = useState<LocalLine[]>([]);
  const [panel, setPanel] = useState<Panel>("none");
  const [notice, setNotice] = useState<string | null>(null);
  const [unseen, setUnseen] = useState(0);
  const [awake, setAwake] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const lineId = useRef(0);
  // Живые сообщения не рендерятся на сервере, поэтому sessionStorage можно читать сразу.
  const [own, setOwn] = useState<Set<string>>(() => (typeof window === "undefined" ? new Set() : ownClientIds()));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const hasPass = live.passExpiresAt !== null && live.passExpiresAt * 1000 > now;
  const muted = live.mutedUntil !== null && live.mutedUntil * 1000 > now;
  const visiblePending = settlePending(pending, live.messages);
  const total = live.messages.length + visiblePending.length + local.length;

  useLayoutEffect(() => {
    const node = scroller.current;
    if (!node) return;
    if (stick.current) {
      node.scrollTop = node.scrollHeight;
      setUnseen(0);
    } else {
      setUnseen((count) => count + 1);
    }
  }, [total]);

  function onScroll() {
    const node = scroller.current;
    if (!node) return;
    stick.current = node.scrollHeight - node.scrollTop - node.clientHeight < NEAR_BOTTOM_PX;
    if (stick.current) setUnseen(0);
  }

  function jumpDown() {
    const node = scroller.current;
    if (!node) return;
    stick.current = true;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    setUnseen(0);
  }

  function runEgg(text: string) {
    stick.current = true;
    setLocal((lines) => [...lines, { id: lineId.current++, text, out: true }]);
    let elapsed = 0;
    for (const reply of thousandMinusSeven()) {
      elapsed += reply.delay;
      window.setTimeout(() => {
        setLocal((lines) => [...lines, { id: lineId.current++, text: reply.text, out: false }]);
        if (reply.effect) {
          setAwake(true);
          window.setTimeout(() => setAwake(false), 1400);
        }
      }, elapsed);
    }
  }

  async function send(text: string): Promise<boolean | void> {
    setNotice(null);
    if (isThousandMinusSeven(text)) {
      runEgg(text);
      return;
    }
    if (!nick) {
      setPanel("nick");
      return false;
    }
    if (!hasPass) {
      setPanel("captcha");
      return false;
    }
    const clientId = newClientId();
    rememberOwn(clientId);
    setOwn((ids) => new Set(ids).add(clientId));
    stick.current = true;
    setPending((items) => [...items, { clientId, nick, text, ts: Date.now() / 1000, state: "sending" }]);
    try {
      await chatApi.send(nick, text, clientId);
      setPending((items) => items.map((item) => (item.clientId === clientId ? { ...item, state: "queued" } : item)));
    } catch (error) {
      const failure = error instanceof ChatApiError ? error : new ChatApiError("network", "");
      const message = errorText(failure.code, failure.message, failure.retryAfter);
      if (["captcha_required", "invalid", "rate_limited", "muted"].includes(failure.code)) {
        setPending((items) => items.filter((item) => item.clientId !== clientId));
        setNotice(message);
        if (failure.code === "captcha_required") {
          setPassExpiresAt(null);
          setPanel("captcha");
        }
        if (failure.code === "invalid" && failure.field === "nick") setPanel("nick");
        return false;
      }
      setPending((items) =>
        items.map((item) => (item.clientId === clientId ? { ...item, state: "failed", error: message } : item)),
      );
    }
  }

  function retry(item: PendingMessage) {
    setPending((items) => items.filter((entry) => entry.clientId !== item.clientId));
    void send(item.text);
  }

  const lockedReason = muted
    ? LIVE_TEXT.muted.replace("{time}", formatTime(new Date((live.mutedUntil ?? 0) * 1000)))
    : null;

  const rows = layoutMessages(live.messages, own, dayLabel);

  return (
    <div className={styles.live} data-awake={awake || undefined}>
      {live.mode === "mock" ? <p className={styles.demo}>{LIVE_TEXT.demo}</p> : null}
      <div className={styles.scroll} ref={scroller} onScroll={onScroll} role="log" aria-label="Сообщения Live-чата" aria-live="polite" tabIndex={0}>
        <div className={styles.column}>
          <ServiceMessage>{LIVE_TEXT.intro}</ServiceMessage>
          {live.loaded && live.messages.length === 0 ? <ServiceMessage>{LIVE_TEXT.empty}</ServiceMessage> : null}
          {rows.map(({ message, day, mine, showAuthor, lastInGroup }) => (
            <Fragment key={message.id}>
              {day ? <ServiceMessage>{day}</ServiceMessage> : null}
              <div className={styles.row} data-mine={mine || undefined}>
                {!mine ? (
                  <span className={styles.avatarSlot}>{lastInGroup ? <Avatar name={message.author} size={34} /> : null}</span>
                ) : null}
                <MessageBubble
                  direction={mine ? "out" : "in"}
                  author={showAuthor ? message.author : undefined}
                  authorTag={showAuthor && message.source === "site" ? LIVE_TEXT.fromSite : undefined}
                  quote={message.quote ?? undefined}
                  time={formatTime(new Date(message.ts * 1000))}
                  tail={lastInGroup}
                  read={mine ? true : undefined}
                >
                  {message.text}
                </MessageBubble>
              </div>
            </Fragment>
          ))}
          {visiblePending.map((item) => (
            <div key={item.clientId} className={styles.row} data-mine>
              <MessageBubble direction="out" time={item.state === "failed" ? LIVE_TEXT.failed : LIVE_TEXT[item.state]}>
                {item.text}
                {item.state === "failed" ? (
                  <span className={styles.failed}>
                    <TriangleAlert size={14} aria-hidden="true" /> {item.error}{" "}
                    <button type="button" className={styles.linkButton} onClick={() => retry(item)}>
                      {LIVE_TEXT.retry}
                    </button>{" "}
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => setPending((items) => items.filter((entry) => entry.clientId !== item.clientId))}
                    >
                      {LIVE_TEXT.dismiss}
                    </button>
                  </span>
                ) : null}
              </MessageBubble>
            </div>
          ))}
          {local.map((line) => (
            <MessageBubble key={`egg-${line.id}`} direction={line.out ? "out" : "in"}>
              {line.text}
            </MessageBubble>
          ))}
        </div>
      </div>
      {live.typing.length > 0 ? (
        <p className={styles.typing} aria-live="polite">
          {(live.typing.length === 1 ? LIVE_TEXT.typingOne : LIVE_TEXT.typingMany)
            .replace("{nick}", live.typing[0]!.nick)
            .replace("{count}", String(live.typing.length - 1))}
          <span className={styles.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </p>
      ) : null}
      {unseen > 0 ? (
        <button type="button" className={styles.jump} onClick={jumpDown}>
          <ArrowDown size={16} aria-hidden="true" /> {LIVE_TEXT.newMessages}
        </button>
      ) : null}
      <div className={styles.bottom}>
        {live.status === "offline" ? <p className={styles.offline}>{LIVE_TEXT.offline}</p> : null}
        {notice ? (
          <p className={styles.notice} role="alert">
            {notice}
          </p>
        ) : null}
        {panel === "nick" || (panel === "none" && !nick && !lockedReason) ? (
          <div className={styles.panel}>
            {!nick && panel === "none" ? <p className={styles.panelHint}>{LIVE_TEXT.needNick}</p> : null}
            <NickForm
              initial={nick}
              min={live.limits.nick_min}
              max={live.limits.nick_max}
              focus={panel === "nick"}
              onSave={(value) => {
                setNick(value);
                setPanel(hasPass ? "none" : "captcha");
              }}
            />
          </div>
        ) : null}
        {panel === "captcha" && !hasPass ? (
          <div className={styles.panel}>
            <CaptchaPanel
              onPassed={(expiresAt) => {
                setPanel("none");
                setNotice(LIVE_TEXT.passOk.replace("{time}", formatTime(new Date(expiresAt * 1000))));
              }}
            />
          </div>
        ) : null}
        {panel === "none" && nick && !hasPass && !lockedReason ? (
          <div className={styles.panel}>
            <p className={styles.panelHint}>{LIVE_TEXT.needPass}</p>
            <button type="button" className={styles.passButton} onClick={() => setPanel("captcha")}>
              {LIVE_TEXT.passButton}
            </button>
          </div>
        ) : null}
        {lockedReason ? <p className={styles.notice}>{lockedReason}</p> : null}
        <Composer
          onSend={send}
          onInput={(value) => {
            if (value.trim() && nick && hasPass) sendTyping(nick);
          }}
          maxLength={live.limits.text_max}
          disabled={Boolean(lockedReason)}
          placeholder={hasPass ? LIVE_TEXT.placeholder : LIVE_TEXT.placeholderLocked}
          label={LIVE_TEXT.placeholder}
          leading={
            nick ? (
              <button type="button" className={styles.nickChip} onClick={() => setPanel(panel === "nick" ? "none" : "nick")} aria-label={`${LIVE_TEXT.nickChange}: ${nick}`}>
                <Avatar name={nick} size={28} />
                <span className={styles.nickText}>{nick}</span>
                <Pencil size={13} aria-hidden="true" />
              </button>
            ) : null
          }
        />
      </div>
    </div>
  );
}
