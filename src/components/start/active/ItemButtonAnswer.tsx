"use client"

import { Check, Lock } from "lucide-react"

import Spinner from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface IProps {
  id: string
  results: boolean
  description: string
  activeIndex: number
  isSelected: boolean
  isCorrect: boolean
  endTintClass: string
  isSubmitting: boolean
  playerInputsLocked: boolean
  answerOptionGlassBase: string
  playerHasSubmittedThisRound: boolean
  /** Напарник выбрал этот вариант. */
  partnerPicked?: boolean
  pairColor?: string
  handleAnswer(answerId: string, index: number): Promise<void>
}

function ItemButtonAnswer({
  playerInputsLocked,
  id,
  activeIndex,
  results,
  handleAnswer,
  isSelected,
  isCorrect,
  isSubmitting,
  description,
  endTintClass,
  answerOptionGlassBase,
  playerHasSubmittedThisRound,
  partnerPicked = false,
  pairColor,
}: IProps) {
  const showBurst = results && isCorrect && isSelected
  const showPartner = partnerPicked && !!pairColor

  return (
    <button
      type="button"
      onClick={() => handleAnswer(id, activeIndex)}
      disabled={playerInputsLocked}
      aria-busy={isSubmitting}
      aria-label={showPartner ? `${description}. Ответ напарника` : undefined}
      className={cn(
        answerOptionGlassBase,
        "relative isolate overflow-hidden text-left transition-all duration-200 select-none disabled:cursor-not-allowed",
        results ? endTintClass : cn(isSelected && "glass-start-slab-selected"),
      )}
      style={showPartner ? { boxShadow: `0 0 0 2px ${pairColor}` } : undefined}
      aria-pressed={isSelected}
    >
      {showBurst ? <span className="answer-burst" aria-hidden /> : null}
      <span className="relative z-10 flex items-center gap-3">
        <span className="min-w-0 flex-1">{description}</span>
        {showPartner ? (
          <span
            className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
            style={{ borderColor: pairColor, color: pairColor }}
          >
            Пара
          </span>
        ) : null}
        {isSubmitting ? (
          <Spinner className="size-4 shrink-0 xl:size-5" />
        ) : results && isCorrect ? (
          <Check className="size-4.5 shrink-0 text-faithful" aria-hidden />
        ) : playerHasSubmittedThisRound && isSelected && !results ? (
          <Lock className="size-4 shrink-0 text-(--accent-orb)" aria-label="Ответ зафиксирован" />
        ) : null}
      </span>
    </button>
  )
}

ItemButtonAnswer.displayName = "ItemButtonAnswer"
export default ItemButtonAnswer
