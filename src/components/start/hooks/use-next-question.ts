"use client"

import { useCallback, useState } from "react"

import { nextQuestion } from "@/api/reports"
import type { EReportStatus } from "@/enum/report"

interface IUseNextQuestionParams {
  reportId: string
  tgId: number
  user_id: number
  statusQuestion: EReportStatus | undefined
  isFetching: boolean
}

/** Переход ведущего к следующему вопросу (доступен только лидеру на статусе END). */
export function useNextQuestion({ reportId, tgId, user_id, statusQuestion, isFetching }: IUseNextQuestionParams) {
  const [loading, setLoading] = useState(false)

  const goToNextQuestion = useCallback(() => {
    if (loading || isFetching || tgId !== user_id || statusQuestion !== "END") return
    setLoading(true)
    nextQuestion(reportId).finally(() =>
      requestAnimationFrame(() => {
        setLoading(false)
      }),
    )
  }, [isFetching, loading, reportId, statusQuestion, tgId, user_id])

  return { loading, goToNextQuestion }
}
