"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getReportUsersAnswersStatus,
  EUsersAnswerStatus,
  type IReportUsersAnswersStatus,
  type TUsersAnswerStatusFromApi,
} from "@/api/reports"
import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"
import { normalizeTelegramId } from "@/lib/normalize"

interface IUseUsersAnswersStatusParams {
  reportId: string | number
  tgId: number
  lastByType: LastSocketEventByType<QuizEvent>
}

export const reportUsersAnswersStatusQueryKey = (reportId: string | number) =>
  ["report-users-answers-status", String(reportId)] as const

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

function resetEndQuestionRefreshDedup() {
  lastEndQuestionRefreshKey = null
}

/** Статусы ответов участников по закрытым вопросам; рефетч по `end-question`. */
export function useUsersAnswersStatus({ reportId, tgId, lastByType }: IUseUsersAnswersStatusParams) {
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching } = useQuery({
    queryFn: () => getReportUsersAnswersStatus(reportId),
    queryKey: reportUsersAnswersStatusQueryKey(reportId),
    enabled: !!reportId && !!tgId,
  })

  useSocketEventEffect(
    lastByType,
    "end-question",
    (event) => {
      if (event.status !== "GAME") return

      const dedupKey = buildEndQuestionRefreshDedupKey(event)
      if (lastEndQuestionRefreshKey === dedupKey) return
      lastEndQuestionRefreshKey = dedupKey

      void queryClient.invalidateQueries({ queryKey: reportUsersAnswersStatusQueryKey(reportId) })
    },
    [queryClient, reportId],
  )

  useSocketEventEffect(lastByType, "next-question", resetEndQuestionRefreshDedup)
  useSocketEventEffect(lastByType, "update-next-question", resetEndQuestionRefreshDedup)
  useSocketEventEffect(lastByType, "start", resetEndQuestionRefreshDedup)

  return {
    matrix: data,
    isLoading,
    isFetching,
  }
}

/** Срез статусов одного участника: ключ — индекс вопроса (number). */
export function statusesByIndexForUser(
  matrix: IReportUsersAnswersStatus | undefined,
  telegramId: string | number,
): Map<number, TUsersAnswerStatusFromApi> {
  const map = new Map<number, TUsersAnswerStatusFromApi>()
  if (!matrix) return map

  const tgKey = normalizeTelegramId(telegramId)
  if (!Number.isFinite(tgKey)) return map

  const row =
    matrix[String(tgKey)] ??
    matrix[String(telegramId)] ??
    Object.entries(matrix).find(([key]) => normalizeTelegramId(key) === tgKey)?.[1]

  if (!row) return map

  for (const [indexKey, status] of Object.entries(row)) {
    const index = Number(indexKey)
    if (!Number.isFinite(index)) continue
    if (
      status === EUsersAnswerStatus.CORRECT ||
      status === EUsersAnswerStatus.WRONG ||
      status === EUsersAnswerStatus.SKIPPED
    ) {
      map.set(index, status)
    }
  }

  return map
}
