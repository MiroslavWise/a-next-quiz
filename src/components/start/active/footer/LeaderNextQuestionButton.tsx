"use client"

import { useEffect, useState } from "react"

import Spinner from "@/components/ui/spinner"
import { footerActionSlotClass } from "./AnswersCollectionProgress"

import { cn } from "@/lib/utils"

/** Пауза после старта вопроса: сокет шлёт обновления раз в ~2 с. */
const QUESTION_START_COOLDOWN_MS = 3_000

export interface LeaderNextQuestionButtonProps {
  onNext: () => void
  actionBlocked: boolean
  showBusy: boolean
  isLastQuestionInQuiz: boolean
}

export default function LeaderNextQuestionButton({
  onNext,
  actionBlocked,
  showBusy,
  isLastQuestionInQuiz,
}: LeaderNextQuestionButtonProps) {
  const [isCooldown, setIsCooldown] = useState(true)
  const [cooldownProgress, setCooldownProgress] = useState(0)

  useEffect(() => {
    let frameId = 0
    let cancelled = false
    const startedAt = Date.now()

    const tick = () => {
      if (cancelled) return

      const elapsed = Date.now() - startedAt
      const progress = Math.min(1, elapsed / QUESTION_START_COOLDOWN_MS)
      setCooldownProgress(progress)

      if (progress >= 1) {
        setIsCooldown(false)
        return
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  const secondsLeft = Math.ceil((1 - cooldownProgress) * (QUESTION_START_COOLDOWN_MS / 1000))
  const nextLabel = isLastQuestionInQuiz ? "Завершить игру" : "Следующий вопрос"

  return (
    <button
      type="button"
      className={cn(
        footerActionSlotClass,
        "relative overflow-hidden text-sm font-semibold",
        isCooldown
          ? "cursor-wait border-amber-300/45 ring-2 ring-amber-400/30"
          : "disabled:cursor-not-allowed disabled:opacity-50",
      )}
      onClick={onNext}
      disabled={actionBlocked || isCooldown}
      aria-busy={isCooldown}
      aria-label={isCooldown ? `${nextLabel}: синхронизация, осталось ${secondsLeft} с` : nextLabel}
    >
      {isCooldown ? (
        <span className="relative z-10 flex flex-col items-center gap-0.5">
          <span className="text-[0.65rem] font-medium tracking-wide text-amber-100/90 uppercase">Синхронизация</span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-white tabular-nums">{secondsLeft}</span>
            <span className="text-xs font-medium text-white/55">сек</span>
          </span>
        </span>
      ) : showBusy ? (
        <Spinner className="size-6" />
      ) : (
        nextLabel
      )}

      {isCooldown ? (
        <>
          <span
            className="pointer-events-none absolute inset-0 bg-amber-500/10"
            style={{ opacity: 0.35 + cooldownProgress * 0.25 }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-amber-300/70 to-amber-200/90"
            style={{ width: `${cooldownProgress * 100}%` }}
            aria-hidden
          />
        </>
      ) : null}
    </button>
  )
}

LeaderNextQuestionButton.displayName = "LeaderNextQuestionButton"
