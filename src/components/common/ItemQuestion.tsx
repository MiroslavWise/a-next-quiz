"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpWideNarrow, ListChevronsDownUp, ListChevronsUpDown, Timer } from "lucide-react"

import Button from "../ui/button"
import { Badge } from "../ui/badge"
import MenuItemQuestion from "./MenuItemQuestion"
import ItemQuestionAnswers from "./ItemQuestionAnswers"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "../ui/item"

import { cn } from "@/lib/utils"
import { getTimeStringS } from "@/enum/time"
import { getPointsStringS } from "@/enum/points"
import type { IQuestion } from "@/interface/question"
import { getQuestionBonusLabel, isNegativeQuestionBonus, normalizeQuestionBonuses } from "@/enum/question-bonus"
import { QuestionBonusIcon } from "@/lib/question-bonus-icons"

interface IProps extends IQuestion {
  tgId: number
  quizId: string
  index: number
}

function ItemQuestion(props: IProps) {
  const { quizId, index, tgId, ...question } = props ?? {}
  const { id, title, time, points, bonuses, imageUrl, image_url } = question ?? {}
  const thumbUrl = imageUrl ?? image_url
  const questionBonuses = normalizeQuestionBonuses(bonuses)
  const [isDragging, setIsDragging] = useState(false)

  function handleDragStart(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    event.preventDefault()
    setIsDragging((s) => !s)
  }

  return (
    <Item variant="outline" size="sm" className="bg-background relative w-full overflow-hidden">
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <div className="flex flex-row items-center gap-1.5">
            <Badge variant="secondary" className="tabular-nums">
              {index + 1}
            </Badge>
            <Badge variant="outline">
              <Timer className="size-3" /> {getTimeStringS(time)}
            </Badge>
          </div>
          <div className="flex flex-row items-center gap-1.5">
            <Badge variant="outline">
              {getPointsStringS(points)} <ArrowUpWideNarrow className="size-3" />
            </Badge>
            <MenuItemQuestion {...question} quizId={quizId!} />
          </div>
        </div>
        <div className="flex w-full items-start justify-between gap-2">
          {thumbUrl ? (
            <ItemMedia className="shrink-0">
              <div className="border-border/60 bg-muted/30 size-7 shrink-0 overflow-hidden rounded-md border">
                <img src={thumbUrl} alt="" className="size-full object-cover" loading="lazy" decoding="async" />
              </div>
            </ItemMedia>
          ) : null}
          <ItemContent className="min-w-0 flex-1">
            <ItemTitle>
              <Link
                href={`/admin/quiz/${quizId}/question/${id}/change`}
                className="line-clamp-2 hover:underline sm:line-clamp-none"
                title={title}
              >
                {title}
              </Link>
            </ItemTitle>
            {questionBonuses.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {questionBonuses.map((bonus) => {
                  const negative = isNegativeQuestionBonus(bonus)

                  return (
                    <Badge
                      key={bonus}
                      variant="outline"
                      className={cn(
                        "text-[0.65rem]",
                        negative
                          ? "border-red-500/40 bg-red-500/10 text-red-950 dark:border-(--unfaithful)/45 dark:bg-(--unfaithful)/14 dark:text-rose-50"
                          : "border-amber-500/35 bg-amber-500/8 text-amber-950 dark:text-amber-50",
                      )}
                    >
                      <QuestionBonusIcon bonus={bonus} className="size-2.5 shrink-0 opacity-90" />
                      {getQuestionBonusLabel(bonus)}
                    </Badge>
                  )
                })}
              </div>
            ) : null}
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="icon" onClick={handleDragStart} className="relative">
              <ListChevronsUpDown
                className={cn(
                  "absolute top-1/2 left-1/2 size-4 -translate-1/2 transition-opacity duration-100",
                  isDragging ? "opacity-0" : "opacity-100",
                )}
              />
              <ListChevronsDownUp
                className={cn(
                  "absolute top-1/2 left-1/2 size-4 -translate-1/2 transition-opacity duration-100",
                  isDragging ? "opacity-100" : "opacity-0",
                )}
              />
            </Button>
          </ItemActions>
        </div>
        <div
          className={cn(
            "grid h-full w-full grid-cols-[minmax(0,1fr)_2.5rem] items-start justify-between gap-2.5",
            isDragging ? "grid opacity-100" : "hidden opacity-0",
          )}
        >
          <ItemQuestionAnswers questionId={id!} tgId={tgId} isDragging={isDragging} />
          <div className="w-10 px-5" />
        </div>
      </div>
    </Item>
  )
}

ItemQuestion.displayName = "ItemQuestion"
export default ItemQuestion
