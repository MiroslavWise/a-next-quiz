"use client"

import { useQuery } from "@tanstack/react-query"
import { Badge, BadgeCheck, FolderOpen } from "lucide-react"

import Skeleton from "../ui/skeleton"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"

import { getAnswers } from "@/api/answers"

interface IProps {
  questionId: string
  tgId: number
  isDragging: boolean
}

function ItemQuestionAnswers({ questionId, tgId, isDragging }: IProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["question-answers", questionId],
    queryFn: () => getAnswers(questionId),
    enabled: !!questionId && !!tgId && isDragging,
  })

  const answers = data ?? []

  return (
    <div className="flex w-full flex-col gap-1">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-4 w-full rounded-md" />)
      ) : (
        <>
          {answers?.length > 0 ? (
            answers.map((answer) => (
              <div key={answer.id} className="grid w-full grid-cols-[1rem_minmax(0,1fr)] items-center gap-2">
                {answer.check ? <BadgeCheck className="size-4 text-emerald-500" /> : <Badge className="text-muted-foreground size-4" />}
                <p className="text-sm font-medium">{answer.description}</p>
              </div>
            ))
          ) : (
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderOpen className="size-4" />
                </EmptyMedia>
                <EmptyTitle>Ответы не найдены</EmptyTitle>
                <EmptyDescription>На этот вопрос нет ответов</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </>
      )}
    </div>
  )
}

ItemQuestionAnswers.displayName = "ItemQuestionAnswers"
export default ItemQuestionAnswers
