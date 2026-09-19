export type GameId =
  | "powerball"
  | "megamillions"
  | "lottoamerica"
  | "millionaire";

export type GameDef = {
  id: GameId;
  name: string;
  blurb: string;
  whiteCount: number;
  whiteMax: number;
  specialMax: number;
  specialName: string;
  specialShort: string;
  price: string;
  draws: string;
  oddsLabel: string;
  multiplierName: string | null;
};

export type Ticket = {
  id: string;
  gameId: GameId;
  whites: number[];
  special: number;
  multiplier: boolean;
  createdAt: number;
  favorite?: boolean;
};

export const GAMES: GameDef[] = [
  {
    id: "powerball",
    name: "Powerball",
    blurb: "5 números de 1 a 69 e 1 Powerball de 1 a 26",
    whiteCount: 5,
    whiteMax: 69,
    specialMax: 26,
    specialName: "Powerball",
    specialShort: "PB",
    price: "US$ 2",
    draws: "Segunda, quarta e sábado",
    oddsLabel: "1 em 292.201.338",
    multiplierName: "Power Play",
  },
  {
    id: "megamillions",
    name: "Mega Millions",
    blurb: "5 números de 1 a 70 e 1 Mega Ball de 1 a 24",
    whiteCount: 5,
    whiteMax: 70,
    specialMax: 24,
    specialName: "Mega Ball",
    specialShort: "MB",
    price: "US$ 5",
    draws: "Terça e sexta",
    oddsLabel: "1 em 290.472.336",
    multiplierName: "Megaplier",
  },
  {
    id: "lottoamerica",
    name: "Lotto America",
    blurb: "5 números de 1 a 52 e 1 Star Ball de 1 a 10",
    whiteCount: 5,
    whiteMax: 52,
    specialMax: 10,
    specialName: "Star Ball",
    specialShort: "SB",
    price: "US$ 1",
    draws: "Segunda, quarta e sábado",
    oddsLabel: "1 em 25.989.600",
    multiplierName: "All Star Bonus",
  },
  {
    id: "millionaire",
    name: "Millionaire for Life",
    blurb: "5 números de 1 a 58 e 1 Millionaire Ball de 1 a 5",
    whiteCount: 5,
    whiteMax: 58,
    specialMax: 5,
    specialName: "Millionaire Ball",
    specialShort: "M",
    price: "US$ 5",
    draws: "Todos os dias",
    oddsLabel: "1 em 22.910.580",
    multiplierName: null,
  },
];

export const GAME_BY_ID: Record<GameId, GameDef> = Object.fromEntries(
  GAMES.map((game) => [game.id, game]),
) as Record<GameId, GameDef>;

function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) throw new Error("maxExclusive must be > 0");
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0] ?? 0;
  } while (x >= limit);
  return x % maxExclusive;
}

export function pickUnique(count: number, max: number): number[] {
  if (count > max) throw new Error("count exceeds pool");
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const a = pool[i];
    const b = pool[j];
    if (a === undefined || b === undefined) continue;
    pool[i] = b;
    pool[j] = a;
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

export function generateTicket(game: GameDef, multiplier: boolean): Ticket {
  return {
    id: crypto.randomUUID(),
    gameId: game.id,
    whites: pickUnique(game.whiteCount, game.whiteMax),
    special: randomInt(game.specialMax) + 1,
    multiplier: Boolean(game.multiplierName) && multiplier,
    createdAt: Date.now(),
  };
}

export function generateTickets(
  game: GameDef,
  count: number,
  multiplier: boolean,
): Ticket[] {
  return Array.from({ length: count }, () => generateTicket(game, multiplier));
}

export function formatTicketLine(game: GameDef, ticket: Ticket): string {
  const whites = ticket.whites
    .map((n) => String(n).padStart(2, "0"))
    .join("  ");
  const special = String(ticket.special).padStart(2, "0");
  const extra = ticket.multiplier && game.multiplierName
    ? `  ·  ${game.multiplierName}`
    : "";
  return `${whites}  +  ${game.specialShort} ${special}${extra}`;
}

export function formatTicketBlock(game: GameDef, tickets: Ticket[]): string {
  const lines = tickets.map((ticket, i) => {
    return `${i + 1}.  ${formatTicketLine(game, ticket)}`;
  });
  return `${game.name} · Lucky Numbers\n${lines.join("\n")}`;
}
