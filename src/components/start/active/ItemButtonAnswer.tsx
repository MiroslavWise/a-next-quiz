"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { Check, Lock } from "lucide-react"

import Spinner from "@/components/ui/spinner"

import { cn } from "@/lib/utils"

interface IProps {
  id: string
  isAnime: boolean
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
  handleAnswer(answerId: string, index: number): Promise<void>
}

function ItemButtonAnswer({
  playerInputsLocked,
  id,
  isAnime,
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
}: IProps) {
  const showBurst = results && isCorrect && isSelected

  return (
    <button
      type="button"
      onClick={() => handleAnswer(id, activeIndex)}
      disabled={playerInputsLocked}
      aria-busy={isSubmitting}
      className={cn(
        answerOptionGlassBase,
        "relative isolate overflow-hidden text-left transition-all duration-200 select-none disabled:cursor-not-allowed",
        results ? endTintClass : cn(isSelected && "glass-start-slab-selected"),
      )}
      aria-pressed={isSelected}
    >
      {showBurst ? <span className="answer-burst" aria-hidden /> : null}
      <span className="relative z-10 flex items-center gap-3">
        <span className="min-w-0 flex-1">{description}</span>
        {isSubmitting ? (
          <>
            {isAnime ? (
              <DotLottieReact
                src="/lottie/anime-rotate.lottie"
                className="size-4 shrink-0 xl:size-5"
                loop
                autoplay
                speed={0.8}
                backgroundColor="transparent"
              />
            ) : (
              <Spinner className="size-4 shrink-0 xl:size-5" />
            )}
          </>
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
