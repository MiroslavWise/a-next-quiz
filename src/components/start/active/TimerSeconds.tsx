import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

import { formatCountdown } from "../hooks/use-question-countdown"
import waveSt from "../styles/timer-waves.module.scss"

interface IProps {
  remainingSeconds: number
  totalSeconds: number
}

const RING_RADIUS = 42
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function TimerSeconds({ remainingSeconds, totalSeconds }: IProps) {
  const isPanic = remainingSeconds <= 8
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)
  let maxScale = 2.8

  if (isPanic) {
    const safeSec = Math.max(0, Math.min(8, remainingSeconds))
    maxScale = 4.0 - safeSec * 0.275
  }

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Осталось ${formatCountdown(remainingSeconds)}`}
      className="relative isolate flex size-28 items-center justify-center sm:size-32"
      style={{ "--wave-max-scale": maxScale } as CSSProperties}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="4.5"
        />
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke={isPanic ? "var(--unfaithful)" : "var(--accent-orb)"}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset,stroke] duration-300 ease-linear"
          style={{
            filter: isPanic
              ? "drop-shadow(0 0 6px color-mix(in srgb, var(--unfaithful) 80%, transparent))"
              : "drop-shadow(0 0 8px color-mix(in srgb, var(--accent-orb) 75%, transparent))",
          }}
        />
      </svg>
      {isPanic ? <span key={remainingSeconds} className={waveSt.timerRingPulse} aria-hidden /> : null}
      <div className="relative z-10 flex flex-col items-center leading-none">
        <span
          className={cn(
            "font-mono text-3xl font-semibold tracking-tight text-white tabular-nums sm:text-4xl",
            isPanic && "text-unfaithful",
          )}
        >
          {remainingSeconds}
        </span>
        <span className="mt-1 text-[0.65rem] font-medium tracking-[0.16em] text-white/45 uppercase">секунд</span>
      </div>
    </div>
  )
}

TimerSeconds.displayName = "TimerSeconds"
export default TimerSeconds
