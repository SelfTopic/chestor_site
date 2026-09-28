// client_id своих отправок: после перезагрузки свои сообщения остаются справа.
const KEY = "chestor-sent";
const LIMIT = 200;

function read(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function rememberOwn(clientId: string): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...read(), clientId].slice(-LIMIT)));
  } catch {
    // Без sessionStorage свои сообщения просто покажутся как чужие после перезагрузки.
  }
}

export function ownClientIds(): Set<string> {
  return new Set(read());
}
