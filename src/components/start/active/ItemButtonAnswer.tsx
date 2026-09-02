"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

import Spinner from "@/components/ui/spinner"

import { cn } from "@/lib/utils"

interface IProps {
  id: string
  str: string
  isAnime: boolean
  results: boolean
  description: string
  activeIndex: number
  isSelected: boolean
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
  str,
  isAnime,
  activeIndex,
  results,
  handleAnswer,
  isSelected,
  isSubmitting,
  description,
  endTintClass,
  answerOptionGlassBase,
  playerHasSubmittedThisRound,
}: IProps) {
  return (
    <button
      type="button"
      onClick={() => handleAnswer(id, activeIndex)}
      disabled={playerInputsLocked}
      aria-busy={isSubmitting}
      className={cn(
        answerOptionGlassBase,
        "text-left transition-all duration-200 select-none disabled:cursor-not-allowed",
        results ? cn(endTintClass, "opacity-100!") : cn(str, "disabled:opacity-70", isSelected && "ring-2 ring-white/70"),
      )}
      aria-pressed={isSelected}
    >
      <span className="flex items-center justify-between gap-1.5 xl:gap-3">
        <span>{description}</span>
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
        ) : playerHasSubmittedThisRound && isSelected && !results ? (
          <span className="shrink-0 text-xs font-semibold text-white/90 xl:text-sm">Вы уже ответили</span>
        ) : null}
      </span>
    </button>
  )
}

ItemButtonAnswer.displayName = "ItemButtonAnswer"
export default ItemButtonAnswer
