import { Copy, Dices, Grid3x3, History, Ticket as TicketIcon } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast, Toaster } from "sonner";
import { PlayGrid } from "@/components/play-grid";
import { TicketSlip } from "@/components/ticket-slip";
import { Button } from "@/components/ui/button";
import { loadHistory, saveHistory } from "@/lib/history";
import {
  formatTicketBlock,
  GAMES,
  GAME_BY_ID,
  generateTickets,
  type GameId,
  type Ticket,
} from "@/lib/lottery";
import { cn } from "@/lib/utils";

const COUNTS = [1, 2, 3, 4, 5] as const;
type Mode = "quick" | "manual";

export function LotteryApp() {
  const [gameId, setGameId] = useState<GameId>("powerball");
  const [count, setCount] = useState<(typeof COUNTS)[number]>(1);
  const [multiplier, setMultiplier] = useState(false);
  const [mode, setMode] = useState<Mode>("quick");
  const [drawing, setDrawing] = useState(false);
  const [current, setCurrent] = useState<Ticket[]>([]);
  const [history, setHistory] = useState<Ticket[]>([]);
  const [ready, setReady] = useState(false);
  const [whites, setWhites] = useState<number[]>([]);
  const [special, setSpecial] = useState<number | null>(null);

  const game = GAME_BY_ID[gameId];

  useEffect(() => {
    setHistory(loadHistory());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveHistory(history);
  }, [history, ready]);

  useEffect(() => {
    setWhites([]);
    setSpecial(null);
    setMultiplier(false);
  }, [gameId]);

  const canAddManual =
    Boolean(game) &&
    whites.length === game.whiteCount &&
    special !== null;

  function persist(tickets: Ticket[]) {
    setHistory((prev) => [...tickets, ...prev].slice(0, 40));
  }

  function handleGenerate() {
    if (!game || drawing) return;
    setDrawing(true);
    window.setTimeout(() => {
      const tickets = generateTickets(game, count, multiplier);
      setCurrent(tickets);
      persist(tickets);
      setDrawing(false);
    }, 420);
  }

  function handleAddManual() {
    if (!game || special === null || !canAddManual) return;
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      gameId: game.id,
      whites: [...whites].sort((a, b) => a - b),
      special,
      multiplier: Boolean(game.multiplierName) && multiplier,
      createdAt: Date.now(),
    };
    setCurrent((prev) => [ticket, ...prev].slice(0, 10));
    persist([ticket]);
    setWhites([]);
    setSpecial(null);
    toast.success("Linha adicionada ao talão");
  }

  function toggleWhite(n: number) {
    if (!game) return;
    setWhites((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= game.whiteCount) return prev;
      return [...prev, n];
    });
  }

  function copyText(text: string) {
    void navigator.clipboard.writeText(text).then(
      () => toast.success("Números copiados"),
      () => toast.error("Não foi possível copiar"),
    );
  }

  function copyCurrent() {
    if (!game || current.length === 0) return;
    copyText(formatTicketBlock(game, current));
  }

  function toggleFavorite(id: string) {
    const flip = (list: Ticket[]) =>
      list.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t));
    setCurrent(flip);
    setHistory(flip);
  }

  function removeFromHistory(id: string) {
    setHistory((prev) => prev.filter((t) => t.id !== id));
  }

  function clearHistory() {
    setHistory((prev) => prev.filter((t) => t.gameId !== gameId));
  }

  const currentIds = useMemo(
    () => new Set(current.map((t) => t.id)),
    [current],
  );
  const historyForGame = useMemo(
    () =>
      history.filter((t) => t.gameId === gameId && !currentIds.has(t.id)),
    [history, gameId, currentIds],
  );

  if (!game) return null;

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <Toaster
        theme="light"
        position="bottom-center"
        toastOptions={{
          className:
            "!bg-paper !text-ink !border-border !font-sans !shadow-none",
        }}
      />

      <header className="px-5 pt-8 pb-6 sm:px-8 sm:pt-10">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-widest text-muted uppercase">
              Loteria americana
            </p>
            <h1 className="mt-1 font-display text-4xl italic leading-none sm:text-5xl">
              Lucky Numbers
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Quick pick com as regras oficiais. Números gerados no seu
              aparelho — cada combinação tem a mesma chance.
            </p>
          </div>
          <span className="mt-1 inline-flex h-8 items-center rounded-full border border-border bg-paper px-3 text-xs font-medium text-muted">
            18+
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
        <nav
          aria-label="Jogos"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0"
        >
          {GAMES.map((g) => {
            const active = g.id === gameId;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setGameId(g.id);
                  setCurrent([]);
                }}
                className={cn(
                  "shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-medium transition-[background-color,color,border-color] duration-150 ease-out",
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-border bg-paper text-ink hover:bg-bg",
                )}
              >
                {g.name}
              </button>
            );
          })}
        </nav>

        <section className="mt-5 rounded-2xl border border-border bg-paper p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl italic leading-tight">
                {game.name}
              </h2>
              <p className="mt-1 text-sm text-muted">{game.blurb}</p>
            </div>
            <p className="text-sm text-muted">
              {game.price} · {game.draws}
            </p>
          </div>
          <p className="mt-3 text-xs text-subtle">
            Jackpot {game.oddsLabel}
            {game.multiplierName
              ? ` · extra opcional: ${game.multiplierName}`
              : ""}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <ModeChip
              active={mode === "quick"}
              onClick={() => setMode("quick")}
              icon={<Dices className="size-3.5" />}
              label="Quick Pick"
            />
            <ModeChip
              active={mode === "manual"}
              onClick={() => setMode("manual")}
              icon={<Grid3x3 className="size-3.5" />}
              label="Grade"
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium tracking-widest text-muted uppercase">
              Linhas
            </p>
            <div className="mt-2 flex gap-1.5">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  aria-pressed={count === n}
                  className={cn(
                    "inline-flex size-11 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-[background-color,color] duration-150 ease-out",
                    count === n
                      ? "bg-ink text-paper"
                      : "bg-bg text-ink hover:bg-border/70",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {game.multiplierName ? (
            <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3">
              <span
                className={cn(
                  "relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-150",
                  multiplier ? "bg-accent" : "bg-border",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 size-5 rounded-full bg-paper transition-transform duration-150 ease-out",
                    multiplier && "translate-x-4",
                  )}
                />
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={multiplier}
                onChange={(e) => setMultiplier(e.target.checked)}
              />
              <span className="text-sm">
                Incluir {game.multiplierName} no talão
              </span>
            </label>
          ) : null}

          {mode === "quick" ? (
            <Button
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              onClick={handleGenerate}
              disabled={drawing}
            >
              <Dices className="size-4" />
              {drawing ? "Sorteando…" : "Sortear números"}
            </Button>
          ) : null}
        </section>

        {mode === "manual" ? (
          <div className="mt-4">
            <PlayGrid
              game={game}
              whites={whites}
              special={special}
              onToggleWhite={toggleWhite}
              onSelectSpecial={setSpecial}
              onClear={() => {
                setWhites([]);
                setSpecial(null);
              }}
              onAdd={handleAddManual}
              canAdd={canAddManual}
            />
          </div>
        ) : null}

        <section className="mt-8" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-xl italic">
              <TicketIcon className="size-4 text-muted" />
              Talão
            </h2>
            {current.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={copyCurrent}>
                <Copy className="size-3.5" />
                Copiar tudo
              </Button>
            ) : null}
          </div>

          {current.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border bg-paper/60 px-5 py-10 text-center text-sm text-muted">
              {mode === "quick"
                ? "Toque em Sortear para preencher o primeiro bilhete."
                : "Marque os números na grade e adicione a linha."}
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {current.map((ticket, i) => (
                <TicketSlip
                  key={ticket.id}
                  ticket={ticket}
                  index={i}
                  onCopy={copyText}
                  onFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-xl italic">
              <History className="size-4 text-muted" />
              Histórico
            </h2>
            {historyForGame.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                Limpar
              </Button>
            ) : null}
          </div>
          {!ready ? (
            <div className="mt-4 h-24 rounded-2xl bg-paper/80" />
          ) : historyForGame.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              As linhas geradas neste aparelho aparecem aqui.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {historyForGame.slice(0, 12).map((ticket, i) => (
                <TicketSlip
                  key={ticket.id}
                  ticket={ticket}
                  index={i}
                  onCopy={copyText}
                  onFavorite={toggleFavorite}
                  onRemove={removeFromHistory}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-subtle">
          <p>
            Lucky Numbers é só um gerador aleatório. Não vende bilhetes, não
            aumenta as suas hipóteses e não é afiliado à Powerball, Mega
            Millions, MUSL nem a qualquer loteria estadual.
          </p>
          <p className="mt-2">
            Jogue com responsabilidade. 18+ (21+ em alguns estados). Ajuda:{" "}
            <span className="text-ink">1-800-522-4700</span>.
          </p>
        </footer>
      </main>
    </div>
  );
}

function ModeChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-[background-color,color,border-color] duration-150 ease-out",
        active
          ? "border-ink bg-ink text-paper"
          : "border-border bg-bg text-ink hover:bg-border/50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
