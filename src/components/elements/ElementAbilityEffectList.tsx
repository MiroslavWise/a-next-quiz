import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  formatAbilityUnlockLevel,
  isAbilityUnlocked,
  type GameElementEffect,
} from "@/lib/game-elements-catalog"

type Variant = "bonus" | "penalty"
type Density = "default" | "compact"

export function ElementAbilityEffectList({
  title,
  effects,
  variant,
  accentColor,
  characterLevel,
  density = "default",
}: {
  title: string
  effects: GameElementEffect[]
  variant: Variant
  accentColor: string
  /** Если задан — незакрытые способности серые. */
  characterLevel?: number
  density?: Density
}) {
  if (effects.length === 0) return null

  const compact = density === "compact"
  const titleCls = compact
    ? "mb-1 text-[0.55rem] font-semibold tracking-[0.12em] text-white/45 uppercase"
    : "mb-1.5 text-[0.65rem] font-semibold tracking-[0.14em] text-white/50 uppercase"
  const itemPad = compact ? "rounded-md border px-2 py-1.5" : "rounded-lg border px-2.5 py-2"
  const nameCls = compact ? "text-[0.65rem] font-semibold" : "text-xs font-semibold"
  const shortCls = compact
    ? "text-[0.55rem] font-medium tracking-wide text-white/50 tabular-nums"
    : "text-[0.65rem] font-medium tracking-wide text-white/55 tabular-nums"
  const detailCls = compact
    ? "mt-0.5 text-[0.6rem] leading-snug text-white/58"
    : "mt-0.5 text-[0.7rem] leading-snug text-white/60"
  const unlockCls = compact
    ? "text-[0.5rem] font-semibold tracking-wide uppercase tabular-nums"
    : "text-[0.6rem] font-semibold tracking-wide uppercase tabular-nums"

  return (
    <div className="min-w-0">
      <p className={titleCls}>{title}</p>
      <ul className={cn("flex min-w-0 flex-col", compact ? "gap-1" : "gap-1.5")}>
        {effects.map((effect) => {
          const unlockLabel = formatAbilityUnlockLevel(effect.unlockLevel)
          const unlocked = isAbilityUnlocked(effect.unlockLevel, characterLevel)
          const titleColor = variant === "bonus" ? accentColor : "#fca5a5"

          return (
            <li
              key={effect.id}
              className={cn(
                itemPad,
                unlocked
                  ? variant === "bonus"
                    ? "border-white/10 bg-white/5"
                    : "border-red-400/20 bg-red-500/8"
                  : "border-white/8 bg-white/3 opacity-55 grayscale",
              )}
              title={unlocked ? undefined : unlockLabel ? `Откроется ${unlockLabel}` : undefined}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0.5">
                <span className="inline-flex min-w-0 items-center gap-1">
                  {!unlocked ? <Lock className="size-2.5 shrink-0 text-white/45" aria-hidden /> : null}
                  <span className={nameCls} style={{ color: unlocked ? titleColor : "rgb(255 255 255 / 0.45)" }}>
                    {effect.title}
                  </span>
                </span>
                <span className="inline-flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0">
                  {unlockLabel ? (
                    <span
                      className={cn(unlockCls, unlocked ? "text-white/40" : "text-white/35")}
                      aria-label={unlocked ? `Открыто ${unlockLabel}` : `Закрыто, ${unlockLabel}`}
                    >
                      {unlockLabel}
                    </span>
                  ) : null}
                  <span className={cn(shortCls, !unlocked && "text-white/35")}>{effect.short}</span>
                </span>
              </div>
              <p className={cn(detailCls, !unlocked && "text-white/40")}>{effect.detail}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
