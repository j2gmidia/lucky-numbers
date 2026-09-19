import { Check, Copy, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { NumberBall } from "@/components/number-ball";
import { Button } from "@/components/ui/button";
import {
  formatTicketLine,
  GAME_BY_ID,
  type Ticket,
} from "@/lib/lottery";
import { cn } from "@/lib/utils";

type TicketSlipProps = {
  ticket: Ticket;
  index: number;
  onCopy: (text: string) => void;
  onFavorite?: (id: string) => void;
  onRemove?: (id: string) => void;
};

export function TicketSlip({
  ticket,
  index,
  onCopy,
  onFavorite,
  onRemove,
}: TicketSlipProps) {
  const game = GAME_BY_ID[ticket.gameId];
  const [copied, setCopied] = useState(false);
  if (!game) return null;

  const line = formatTicketLine(game, ticket);

  function handleCopy() {
    onCopy(line);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article
      className="ticket-slip rise-in rounded-2xl border border-border px-5 py-4 pl-7 shadow-[0_1px_0_rgba(23,20,17,0.04)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted uppercase">
            Linha {index + 1}
            {ticket.multiplier && game.multiplierName
              ? ` · ${game.multiplierName}`
              : ""}
          </p>
          <p className="mt-0.5 font-display text-lg italic leading-tight text-ink">
            {game.name}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          {onFavorite ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label={
                ticket.favorite ? "Remover dos favoritos" : "Favoritar"
              }
              onClick={() => onFavorite(ticket.id)}
            >
              <Star
                className={cn(
                  "size-4",
                  ticket.favorite && "fill-accent text-accent",
                )}
              />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label="Copiar números"
            onClick={handleCopy}
          >
            <span className="relative inline-flex size-4 items-center justify-center">
              <Check
                className={cn(
                  "absolute size-4 text-ink transition-[opacity,transform,filter] duration-200 ease-in-out",
                  copied
                    ? "scale-100 opacity-100 blur-none"
                    : "scale-[0.25] opacity-0 blur-sm",
                )}
              />
              <Copy
                className={cn(
                  "size-4 transition-[opacity,transform,filter] duration-200 ease-in-out",
                  copied
                    ? "scale-[0.25] opacity-0 blur-sm"
                    : "scale-100 opacity-100 blur-none",
                )}
              />
            </span>
          </Button>
          {onRemove ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              aria-label="Remover"
              onClick={() => onRemove(ticket.id)}
            >
              <Trash2 className="size-4 text-muted" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {ticket.whites.map((n, i) => (
          <NumberBall key={`${ticket.id}-w-${n}`} n={n} delayMs={i * 40} />
        ))}
        <span className="px-1 text-subtle" aria-hidden>
          +
        </span>
        <NumberBall
          n={ticket.special}
          special
          delayMs={ticket.whites.length * 40}
        />
        <span className="ml-1 text-xs font-medium tracking-wide text-muted">
          {game.specialShort}
        </span>
      </div>
    </article>
  );
}
