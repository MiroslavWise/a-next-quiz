import { ElementEffectChip } from "@/components/elements/ElementEffectChip";

import { cn } from "@/lib/utils";
import type { IElementEffect } from "@/interface/element-effect";

export function ElementEffectsList({
  effects,
  compact = false,
  variant,
  className,
}: {
  effects: IElementEffect[] | undefined;
  compact?: boolean;
  variant?: "default" | "compact" | "strip";
  className?: string;
}) {
  if (!effects?.length) return null;

  const resolvedVariant = variant ?? (compact ? "compact" : "default");
  const isStrip = resolvedVariant === "strip";

  return (
    <div className={cn("min-w-0", className)}>
      <ul className={cn("flex flex-wrap", isStrip ? "gap-2" : "gap-1.5")}>
        {effects.map((effect) => (
          <li
            key={`${effect.id}-${effect.points}`}
            className="min-w-0 max-w-full"
          >
            <ElementEffectChip effect={effect} variant={resolvedVariant} />
          </li>
        ))}
      </ul>
    </div>
  );
}
