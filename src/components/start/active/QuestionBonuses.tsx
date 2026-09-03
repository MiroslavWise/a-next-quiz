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
    <div ref={rootRef} className="relative flex w-full flex-col items-center gap-1.5">
      <div className="flex items-center justify-center gap-1">
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
                "flex size-7 items-center justify-center rounded-full border transition-shadow",
                isNegativeQuestionBonus(bonus)
                  ? "border-(--unfaithful)/45 bg-(--unfaithful)/14 text-rose-50"
                  : "border-(--accent-orb)/45 bg-(--accent-orb)/14 text-amber-50",
                isActive && "ring-2 ring-white/35",
              )}
            >
              <QuestionBonusIcon bonus={bonus} className="size-3 shrink-0 opacity-90" />
            </button>
          )
        })}
      </div>
      {activeBonus ? (
        <span
          className={cn(
            "flex w-full max-w-sm items-start gap-1.5 rounded-lg border px-2 py-1.5 text-left leading-snug font-medium",
            "text-[0.62rem] lg:gap-2 lg:px-2.5 lg:py-2 lg:text-[0.68rem]",
            negative
              ? "border-(--unfaithful)/45 bg-(--unfaithful)/14 text-rose-50"
              : "border-(--accent-orb)/45 bg-(--accent-orb)/14 text-amber-50",
          )}
        >
          <QuestionBonusIcon bonus={activeBonus} className="mt-0.5 size-2.5 shrink-0 opacity-90 lg:size-3" />
          <span className="min-w-0 text-pretty">{getQuestionBonusDetail(activeBonus)}</span>
        </span>
      ) : null}
    </div>
  )
}

QuestionBonuses.displayName = "QuestionBonuses"
export default QuestionBonuses
