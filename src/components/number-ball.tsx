import { cn, pad2 } from "@/lib/utils";

type NumberBallProps = {
  n: number;
  special?: boolean;
  delayMs?: number;
  size?: "md" | "lg";
};

export function NumberBall({
  n,
  special = false,
  delayMs = 0,
  size = "md",
}: NumberBallProps) {
  return (
    <span
      className={cn(
        "ball-enter inline-flex items-center justify-center rounded-full font-medium tabular-nums leading-none",
        size === "lg" ? "size-12 text-base" : "size-11 text-sm",
        special
          ? "bg-special text-special-fg shadow-[0_1px_0_rgba(180,35,24,0.35)]"
          : "bg-ball text-ball-fg border border-border",
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {pad2(n)}
    </span>
  );
}
