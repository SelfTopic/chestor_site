// Быстрая проверка ника в браузере; окончательно решает сервер.
const ALLOWED = /^[\p{L}\p{N}_ .-]+$/u;

export type NickCheck = { ok: true; nick: string } | { ok: false; reason: string };

export function checkNick(raw: string, min = 2, max = 24): NickCheck {
  const nick = raw.normalize("NFKC").replace(/\s+/g, " ").trim();
  const length = Array.from(nick).length;
  if (length < min || length > max) return { ok: false, reason: `Ник — от ${min} до ${max} символов` };
  if (!ALLOWED.test(nick)) return { ok: false, reason: "Только буквы, цифры, пробел, точка, дефис и _" };
  return { ok: true, nick };
}
