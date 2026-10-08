"use client"

import { useState } from "react"
import Image from "next/image"
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
import { getQuestionBonusLabel, isNegativeQuestionBonus, isTeamQuestionBonus, normalizeQuestionBonuses } from "@/enum/question-bonus"
import { questionElementHint, questionElementVisual } from "@/lib/question-element"
import { QuestionBonusIcon } from "@/lib/question-bonus-icons"

interface IProps extends IQuestion {
  tgId: number
  quizId: string
  index: number
}

function ItemQuestion(props: IProps) {
  const { quizId, index, tgId, ...question } = props ?? {}
  const { id, title, time, points, bonuses, element, imageUrl, image_url } = question ?? {}
  const thumbUrl = imageUrl ?? image_url
  const questionBonuses = normalizeQuestionBonuses(bonuses)
  const elementVisual = questionElementVisual(element)
  const [isDragging, setIsDragging] = useState(false)

  function handleDragStart(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    event.preventDefault()
    setIsDragging((s) => !s)
  }

  return (
    <Item
      variant="outline"
      size="sm"
      className="bg-background relative w-full overflow-visible"
      style={elementVisual ? { borderColor: elementVisual.accentColor } : undefined}
    >
      {elementVisual ? (
        <span
          aria-hidden
          title={questionElementHint(elementVisual.id)}
          className="pointer-events-none absolute top-0 left-0 z-20 flex size-6 -translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full border bg-background"
          style={{ position: "absolute", borderColor: elementVisual.accentColor }}
        >
          <Image src={elementVisual.iconSrc} alt="" width={14} height={14} className="size-3.5 object-contain" />
        </span>
      ) : null}
      {questionBonuses.length > 0 ? (
        <div className="absolute top-0 right-0 z-20 flex translate-x-1/3 -translate-y-1/3 flex-row-reverse items-center">
          {questionBonuses.map((bonus, index) => {
            const team = isTeamQuestionBonus(bonus)
            const negative = !team && isNegativeQuestionBonus(bonus)
            const label = getQuestionBonusLabel(bonus)

            return (
              <span
                key={bonus}
                title={label}
                aria-label={label}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border bg-background",
                  index > 0 && "-mr-1.5",
                  team && "border-sky-400/70 text-sky-700 dark:text-sky-100",
                  negative && "border-(--unfaithful)/70 text-red-700 dark:text-rose-50",
                  !team && !negative && "border-amber-500/70 text-amber-700 dark:text-amber-100",
                )}
                style={{ zIndex: index + 1 }}
              >
                <QuestionBonusIcon bonus={bonus} className="size-2.5 shrink-0" />
              </span>
            )
          })}
        </div>
      ) : null}
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
