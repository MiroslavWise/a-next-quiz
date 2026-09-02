"use client"

import { useMemo } from "react"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"

import { getReportUserPoints, reportUserTotalPoints, type IReportUserPoints } from "@/api/reports"
import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"

interface IUseReportUserPointsParams {
  reportId: string | number
  tgId: number
  lastByType: LastSocketEventByType<QuizEvent>
  /** Сохранять предыдущие данные при рефетче (таблица лидеров). */
  keepPrevious?: boolean
}

export const reportUserPointsQueryKey = (reportId: string | number) => ["report-user-points", String(reportId)] as const

function buildEndQuestionRefreshDedupKey(message: Record<string, unknown>): string {
  const time = message.time
  if (typeof time === "number" && Number.isFinite(time)) return `end-question:${time}`

  const rawIndex = message.index ?? message.active_index
  const index = typeof rawIndex === "number" ? rawIndex : String(rawIndex ?? "")
  const questionId = message.question_id ?? message.questionId ?? ""
  return `end-question:${String(questionId)}:${index}`
}

/** Один refetch на `end-question`, даже если хук подключён в нескольких компонентах. */
let lastEndQuestionRefreshKey: string | null = null

export function sortReportUserPointsDesc(points: IReportUserPoints[] | undefined): IReportUserPoints[] {
  return (points ?? []).toSorted((a, b) => reportUserTotalPoints(b) - reportUserTotalPoints(a))
}

function resetEndQuestionRefreshDedup() {
  lastEndQuestionRefreshKey = null
}

/** Очки участников отчёта с рефетчем по сокет-событию `end-question`. */
export function useReportUserPoints({ reportId, tgId, lastByType, keepPrevious = false }: IUseReportUserPointsParams) {
  const queryClient = useQueryClient()

  const { data, isFetching, isPlaceholderData, isLoading } = useQuery({
    queryFn: () => getReportUserPoints(reportId),
    queryKey: reportUserPointsQueryKey(reportId),
    enabled: !!reportId && !!tgId,
    ...(keepPrevious ? { placeholderData: keepPreviousData } : {}),
  })

  useSocketEventEffect(
    lastByType,
    "end-question",
    (event) => {
      if (event.status !== "GAME") return

      const dedupKey = buildEndQuestionRefreshDedupKey(event)
      if (lastEndQuestionRefreshKey === dedupKey) return
      lastEndQuestionRefreshKey = dedupKey

      void queryClient.invalidateQueries({ queryKey: reportUserPointsQueryKey(reportId) })
    },
    [queryClient, reportId],
  )

  useSocketEventEffect(lastByType, "next-question", resetEndQuestionRefreshDedup)
  useSocketEventEffect(lastByType, "update-next-question", resetEndQuestionRefreshDedup)
  useSocketEventEffect(lastByType, "start", resetEndQuestionRefreshDedup)

  const sortedData = useMemo(() => sortReportUserPointsDesc(data), [data])
  const isBackgroundRefreshing = keepPrevious && isFetching && isPlaceholderData

  return {
    sortedData,
    isLoading,
    isBackgroundRefreshing,
  }
}
