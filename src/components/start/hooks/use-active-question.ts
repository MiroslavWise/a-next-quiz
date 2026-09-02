"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { getActiveIndexQuestion } from "@/api/reports"

interface IUseActiveQuestionParams {
  reportId: string
  tgId: number
}

/** Активный вопрос отчёта (`GET /report/{id}/active-index`) и производные от него флаги. */
export function useActiveQuestion({ reportId, tgId }: IUseActiveQuestionParams) {
  const activeQuestionQueryKey = useMemo(() => ["active-questions", reportId] as const, [reportId])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: activeQuestionQueryKey,
    queryFn: () => getActiveIndexQuestion(reportId),
    enabled: !!reportId && !!tgId,
  })

  const statusQuestion = data?.status
  const question = data?.question
  const answers = data?.answers || []
  const activeIndex = data?.active_index ?? 0
  const isQuestionEnded = statusQuestion === "END"
  const collectingAnswers = statusQuestion === "GAME"

  return {
    data,
    isLoading,
    isFetching,
    activeQuestionQueryKey,
    statusQuestion,
    question,
    answers,
    activeIndex,
    isQuestionEnded,
    collectingAnswers,
  }
}
