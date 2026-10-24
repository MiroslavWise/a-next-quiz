import PickaxeIcon from "@/components/icons/PickaxeIcon";

import { cn } from "@/lib/utils";
import type { IElementEffect } from "@/interface/element-effect";
import {
  formatElementEffectPoints,
  getElementEffectVisual,
} from "@/lib/element-effects-visual";

export function ElementEffectChip({
  effect,
  compact = false,
  variant,
  className,
}: {
  effect: IElementEffect;
  compact?: boolean;
  variant?: "default" | "compact" | "strip";
  className?: string;
}) {
  const visual = getElementEffectVisual(effect);
  const pointsLabel = formatElementEffectPoints(effect.points);
  const isPenalty = visual.tone === "penalty";
  const resolvedVariant = variant ?? (compact ? "compact" : "default");

  const size =
    resolvedVariant === "strip"
      ? {
          chip: "rounded-md px-2.5 py-1 shadow-[2px_2px_0_0_#0a0c0b]",
          title: "text-[0.7rem]",
          icon: "size-2.5",
          pickaxe: "size-3",
        }
      : resolvedVariant === "compact"
        ? {
            chip: "rounded-md px-1.5 py-0.5",
            title: "text-[0.6rem]",
            icon: "size-2",
            pickaxe: "size-2.5",
          }
        : {
            chip: "rounded-md px-2 py-1",
            title: "text-[0.65rem]",
            icon: "size-2.5",
            pickaxe: "size-3",
          };

  return (
    <span
      className={cn(
        "relative inline-flex max-w-full min-w-0 items-center gap-1.5 leading-none",
        size.chip,
        className,
      )}
      style={{
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: isPenalty ? "color-mix(in srgb, var(--unfaithful) 70%, #0a0c0b)" : visual.accentColor,
        backgroundColor: isPenalty
          ? "rgb(239 68 68 / 0.14)"
          : `${visual.accentColor}18`,
      }}
      title={effect.title}
    >
      <span className={cn("relative shrink-0", size.icon)}>
        {visual.iconSrc ? (
          <img
            src={visual.iconSrc}
            alt=""
            className="absolute top-1/2 left-1/2 size-full -translate-1/2 object-contain"
            draggable={false}
          />
        ) : (
          <span
            className="size-full rounded-sm"
            style={{
              backgroundColor: visual.accentColor,
              color: visual.accentColor,
            }}
            aria-hidden
          />
        )}
      </span>
      <span
        className={cn(
          "min-w-0 leading-none font-medium whitespace-nowrap text-white/88",
          size.title,
          resolvedVariant === "compact" && "truncate",
        )}
      >
        {effect.title}
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-0.5 leading-none font-bold tabular-nums whitespace-nowrap",
          size.title,
          isPenalty ? "text-rose-200" : "text-white/92",
        )}
      >
        {pointsLabel}
        <PickaxeIcon points={effect.points} className={size.pickaxe} />
      </span>
    </span>
  );
}
