import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

import { formatCountdown } from "../hooks/use-question-countdown"
import waveSt from "../styles/timer-waves.module.scss"

interface IProps {
  remainingSeconds: number
  /** Уменьшенный таймер на узких экранах (карточка вопроса). */
  compact?: boolean
}

const styleSecond = (s: number) =>
  s <= 2 ? "bg-red-500/75" : s <= 4 ? "bg-rose-500/75" : s <= 6 ? "bg-fuchsia-500/75" : s <= 8 ? "bg-purple-500/75" : "bg-amber-500/75"

function TimerSeconds({ remainingSeconds, compact = false }: IProps) {
  const isPanic = remainingSeconds <= 8
  let maxScale = 2.8

  if (isPanic) {
    const safeSec = Math.max(0, Math.min(8, remainingSeconds))
    maxScale = 4.0 - safeSec * 0.275
  }

  return (
    <div
      key={remainingSeconds}
      role="timer"
      aria-live="polite"
      aria-label={`Осталось ${formatCountdown(remainingSeconds)}`}
      className={cn(
        "flex items-center justify-center rounded-full",
        compact ? "size-6 lg:size-7" : "size-7",
        styleSecond(remainingSeconds),
        waveSt.timerCircle,
        compact && waveSt.timerCircleCompact,
        isPanic && waveSt.panicMode,
      )}
      style={{ "--wave-max-scale": maxScale } as CSSProperties}
    >
      <span
        className={cn(
          "leading-none font-medium whitespace-nowrap text-white tabular-nums",
          compact ? "text-xs lg:text-sm" : "text-sm",
        )}
      >
        {remainingSeconds}
      </span>
    </div>
  )
}

TimerSeconds.displayName = "TimerSeconds"
export default TimerSeconds
