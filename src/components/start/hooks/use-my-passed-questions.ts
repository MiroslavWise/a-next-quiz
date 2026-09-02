"use client"

import { useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"

import { getReportMyPassedQuestions } from "@/api/reports"

interface IUseMyPassedQuestionsParams {
  reportId: string
  tgId: number
  isObserverLikeLeader: boolean
  /** Статус активного вопроса из `GET /report/{id}/active-index`. */
  isQuestionEnded: boolean
}

/** Список пройденных текущим игроком вопросов + рефетч при переходе GAME → END. */
export function useMyPassedQuestions({ reportId, tgId, isObserverLikeLeader, isQuestionEnded }: IUseMyPassedQuestionsParams) {
  const wasQuestionEndedRef = useRef(isQuestionEnded)

  const {
    data: myPassedQuestions,
    refetch: refetchMyPassedQuestions,
    isFetching: isFetchingMyPassedQuestions,
    isFetched,
  } = useQuery({
    queryKey: ["report-my-passed-questions", reportId],
    queryFn: () => getReportMyPassedQuestions(reportId),
    enabled: !!reportId && !!tgId && !isObserverLikeLeader,
  })

  useEffect(() => {
    if (isObserverLikeLeader) return

    const enteringEnd = isQuestionEnded && !wasQuestionEndedRef.current
    wasQuestionEndedRef.current = isQuestionEnded

    if (!enteringEnd) return

    // Первая загрузка ещё не завершена или уже в полёте — useQuery сам сходит, refetch не нужен
    if (!isFetched || isFetchingMyPassedQuestions) return

    void refetchMyPassedQuestions()
  }, [isObserverLikeLeader, isQuestionEnded, isFetched, isFetchingMyPassedQuestions, refetchMyPassedQuestions])

  return { myPassedQuestions, refetchMyPassedQuestions, isFetchingMyPassedQuestions }
}
