"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { QuestionBonusIcon } from "@/lib/question-bonus-icons"
import {
  getQuestionBonusDetail,
  getQuestionBonusLabel,
  isNegativeQuestionBonus,
  normalizeQuestionBonuses,
  type QuestionBonus,
} from "@/enum/question-bonus"

interface IQuestionBonusesProps {
  bonuses?: QuestionBonus[] | null
}

function QuestionBonuses({ bonuses }: IQuestionBonusesProps) {
  const [activeBonus, setActiveBonus] = useState<QuestionBonus | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const items = normalizeQuestionBonuses(bonuses)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setActiveBonus(null)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  if (items.length === 0) return null

  function handleBonusClick(bonus: QuestionBonus) {
    setActiveBonus((current) => (current === bonus ? null : bonus))
  }

  const negative = activeBonus ? isNegativeQuestionBonus(activeBonus) : false

  return (
    <>
      <div ref={rootRef} className="absolute top-full left-4 z-50 -translate-y-1/2">
        <div className="flex items-center gap-0.5">
          {items.map((bonus) => {
            const isActive = activeBonus === bonus

            return (
              <button
                key={`circle-${bonus}`}
                type="button"
                aria-expanded={isActive}
                aria-label={getQuestionBonusLabel(bonus)}
                onClick={() => handleBonusClick(bonus)}
                className={cn(
                  "bg-background/95 h-fit w-fit cursor-pointer rounded-full p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_20px_rgba(0,0,0,0.24)] transition-shadow duration-500",
                  isActive && "ring-2 ring-white/35",
                )}
              >
                <div
                  className={cn(
                    "flex size-6.5 items-center justify-center rounded-full border lg:size-7.5",
                    isNegativeQuestionBonus(bonus)
                      ? "border-(--unfaithful)/45 bg-(--unfaithful)/14 text-rose-50"
                      : "border-(--accent-orb)/45 bg-(--accent-orb)/14 text-amber-50",
                  )}
                >
                  <QuestionBonusIcon bonus={bonus} className="size-2.5 shrink-0 opacity-90 lg:size-3" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div
        className={cn(
          "bg-background/95 pointer-events-none absolute top-full left-0 z-60 w-[min(calc(100vw-2rem),18rem)] rounded-[0.625rem] p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_20px_rgba(0,0,0,0.24)] transition-all duration-500",
          activeBonus ? "translate-y-1 opacity-100" : "-translate-y-1 opacity-0",
        )}
      >
        {!!activeBonus && (
          <span
            className={cn(
              "flex w-full items-start gap-1.5 rounded-lg border px-2 py-1.5 text-left leading-snug font-medium",
              "text-[0.62rem] lg:gap-2 lg:px-2.5 lg:py-2 lg:text-[0.68rem]",
              negative
                ? "border-(--unfaithful)/45 bg-(--unfaithful)/14 text-rose-50"
                : "border-(--accent-orb)/45 bg-(--accent-orb)/14 text-amber-50",
            )}
          >
            <QuestionBonusIcon bonus={activeBonus} className="mt-0.5 size-2.5 shrink-0 opacity-90 lg:size-3" />
            <span className="min-w-0 text-pretty">{getQuestionBonusDetail(activeBonus)}</span>
          </span>
        )}
      </div>
    </>
  )
}

QuestionBonuses.displayName = "QuestionBonuses"
export default QuestionBonuses
