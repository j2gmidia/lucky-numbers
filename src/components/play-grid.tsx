import { Button } from "@/components/ui/button";
import type { GameDef } from "@/lib/lottery";
import { cn, pad2 } from "@/lib/utils";

type PlayGridProps = {
  game: GameDef;
  whites: number[];
  special: number | null;
  onToggleWhite: (n: number) => void;
  onSelectSpecial: (n: number) => void;
  onClear: () => void;
  onAdd: () => void;
  canAdd: boolean;
};

export function PlayGrid({
  game,
  whites,
  special,
  onToggleWhite,
  onSelectSpecial,
  onClear,
  onAdd,
  canAdd,
}: PlayGridProps) {
  const whiteSelected = new Set(whites);

  return (
    <section className="rounded-2xl border border-border bg-paper p-4 sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl italic leading-tight">
            Preencher na grade
          </h2>
          <p className="mt-1 text-sm text-muted">
            Toque em {game.whiteCount} números e 1 {game.specialName}.
          </p>
        </div>
        <p className="text-sm tabular-nums text-muted">
          {whites.length}/{game.whiteCount}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 sm:grid-cols-10">
        {Array.from({ length: game.whiteMax }, (_, i) => i + 1).map((n) => {
          const on = whiteSelected.has(n);
          return (
            <button
              key={`w-${n}`}
              type="button"
              onClick={() => onToggleWhite(n)}
              aria-pressed={on}
              className={cn(
                "aspect-square min-h-9 rounded-md text-xs font-medium tabular-nums transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
                on
                  ? "bg-ink text-paper"
                  : "bg-bg text-ink hover:bg-border/60",
              )}
            >
              {pad2(n)}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium tracking-widest text-muted uppercase">
          {game.specialName}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from({ length: game.specialMax }, (_, i) => i + 1).map((n) => {
            const on = special === n;
            return (
              <button
                key={`s-${n}`}
                type="button"
                onClick={() => onSelectSpecial(n)}
                aria-pressed={on}
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
                  on
                    ? "bg-special text-special-fg"
                    : "bg-bg text-ink hover:bg-border/60",
                )}
              >
                {pad2(n)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="primary"
          className="flex-1"
          disabled={!canAdd}
          onClick={onAdd}
        >
          Adicionar ao talão
        </Button>
        <Button variant="secondary" onClick={onClear}>
          Limpar grade
        </Button>
      </div>
    </section>
  );
}
