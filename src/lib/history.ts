import type { Ticket } from "@/lib/lottery";

const KEY = "luckyslip-history-v1";
const MAX = 40;

export function loadHistory(): Ticket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTicket);
  } catch {
    return [];
  }
}

export function saveHistory(tickets: Ticket[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(tickets.slice(0, MAX)));
}

function isTicket(value: unknown): value is Ticket {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<Ticket>;
  return (
    typeof t.id === "string" &&
    typeof t.gameId === "string" &&
    Array.isArray(t.whites) &&
    typeof t.special === "number"
  );
}
