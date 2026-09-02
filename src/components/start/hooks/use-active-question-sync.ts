"use client"

import { useRef } from "react"
import { type QueryClient } from "@tanstack/react-query"

import { type IReportActiveIndexResponse } from "@/api/reports"
import { EReportStatus } from "@/enum/report"
import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"
import { normalizeActiveIndexSnapshot } from "@/lib/normalize-active-index"

/** Проверка, что payload сокет-события — полноценный снимок активного вопроса. */
export function isActiveIndexSnapshot(value: unknown): value is IReportActiveIndexResponse {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return "question" in v && "answers" in v && "status" in v && "active_index" in v
}

const syncActiveIndexTypes = ["start", "next-question", "update-next-question", "end-question", "update-end-question"] as const

type SyncActiveIndexType = (typeof syncActiveIndexTypes)[number]

const updateSyncTypes = new Set<SyncActiveIndexType>(["update-next-question", "update-end-question"])

interface IUseActiveQuestionSyncParams {
  lastByType: LastSocketEventByType<QuizEvent>
  queryClient: QueryClient
  activeQuestionQueryKey: readonly ["active-questions", string]
  reportId: string
}

function readMessageRecord(lastMessage: unknown): Record<string, unknown> | null {
  if (!lastMessage || typeof lastMessage !== "object") return null
  return lastMessage as Record<string, unknown>
}

function readMessageIndex(message: Record<string, unknown>): number | null {
  const raw = message.index ?? message.active_index
  if (typeof raw === "number" && Number.isFinite(raw)) return raw
  if (typeof raw === "string") {
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }
  return null
}

/** Ключ для dedup invalidate: одно и то же WS-событие не должно дёргать HTTP повторно. */
function buildSyncInvalidateDedupKey(message: Record<string, unknown>, type: SyncActiveIndexType): string {
  const time = message.time
  if (typeof time === "number" && Number.isFinite(time)) {
    return `${type}:${time}`
  }

  const index = readMessageIndex(message)
  const questionId = message.question_id ?? message.questionId
  return `${type}:${String(questionId ?? "")}:${String(index ?? "")}`
}

function expectedQuestionStatusForSyncType(type: SyncActiveIndexType): EReportStatus | null {
  if (type === "update-end-question" || type === "end-question") return EReportStatus.END
  if (type === "start" || type === "update-next-question" || type === "next-question") return EReportStatus.GAME
  return null
}

function isStartGameSnapshot(message: Record<string, unknown>, type: SyncActiveIndexType): boolean {
  if (type !== "start") return true
  return message.status === EReportStatus.GAME
}

/** Кэш уже отражает итог события — повторный invalidate не нужен. */
function cacheAlreadyMatchesSyncEvent(
  cached: IReportActiveIndexResponse | undefined,
  type: SyncActiveIndexType,
  message: Record<string, unknown>,
): boolean {
  if (!cached) return false

  const expectedStatus = expectedQuestionStatusForSyncType(type)
  if (expectedStatus && cached.status !== expectedStatus) return false

  const messageIndex = readMessageIndex(message)
  if (messageIndex != null && cached.active_index !== messageIndex) return false

  return true
}

function shouldInvalidateWithoutSnapshot(
  queryClient: QueryClient,
  activeQuestionQueryKey: readonly ["active-questions", string],
  message: Record<string, unknown>,
  type: SyncActiveIndexType,
  lastInvalidateDedupKeyRef: { current: string | null },
): boolean {
  const dedupKey = buildSyncInvalidateDedupKey(message, type)
  if (lastInvalidateDedupKeyRef.current === dedupKey) return false

  const cached = queryClient.getQueryData<IReportActiveIndexResponse>(activeQuestionQueryKey)

  if (updateSyncTypes.has(type) && cacheAlreadyMatchesSyncEvent(cached, type, message)) {
    lastInvalidateDedupKeyRef.current = dedupKey
    return false
  }

  const queryState = queryClient.getQueryState(activeQuestionQueryKey)
  if (updateSyncTypes.has(type) && queryState?.fetchStatus === "fetching") {
    lastInvalidateDedupKeyRef.current = dedupKey
    return false
  }

  lastInvalidateDedupKeyRef.current = dedupKey
  return true
}

function applyActiveIndexSync(
  event: QuizEvent,
  queryClient: QueryClient,
  activeQuestionQueryKey: readonly ["active-questions", string],
  lastInvalidateDedupKeyRef: { current: string | null },
) {
  const type = event.type
  if (!type || !syncActiveIndexTypes.includes(type as SyncActiveIndexType)) return

  const syncType = type as SyncActiveIndexType
  const message = readMessageRecord(event)
  if (!message) return
  if (!isStartGameSnapshot(message, syncType)) return

  const payload = event.data
  if (isActiveIndexSnapshot(payload)) {
    lastInvalidateDedupKeyRef.current = null
    queryClient.setQueryData<IReportActiveIndexResponse>(activeQuestionQueryKey, normalizeActiveIndexSnapshot(payload))
    return
  }

  if (!shouldInvalidateWithoutSnapshot(queryClient, activeQuestionQueryKey, message, syncType, lastInvalidateDedupKeyRef)) {
    return
  }

  void queryClient.invalidateQueries({ queryKey: activeQuestionQueryKey, exact: true })
}

/**
 * Поддерживает кэш активного вопроса в актуальном состоянии по сокет-событиям:
 * - снимок вопроса → пишем в кэш напрямую (без лишнего запроса);
 * - иначе инвалидируем (догон после краткого обрыва, см. docs/API.md);
 * - `update-*` без snapshot → dedup: не invalidate, если кэш уже совпадает или запрос в полёте;
 * - `user-removed` → инвалидируем список участников.
 *
 * Каждый `type` — отдельный эффект: одновременные события не затирают друг друга.
 */
export function useActiveQuestionSync({ lastByType, queryClient, activeQuestionQueryKey, reportId }: IUseActiveQuestionSyncParams) {
  const lastInvalidateDedupKeyRef = useRef<string | null>(null)
  const syncDeps = [queryClient, activeQuestionQueryKey] as const

  const applySync = (event: QuizEvent) => {
    applyActiveIndexSync(event, queryClient, activeQuestionQueryKey, lastInvalidateDedupKeyRef)
  }

  useSocketEventEffect(lastByType, "start", applySync, syncDeps)
  useSocketEventEffect(lastByType, "next-question", applySync, syncDeps)
  useSocketEventEffect(lastByType, "update-next-question", applySync, syncDeps)
  useSocketEventEffect(lastByType, "end-question", applySync, syncDeps)
  useSocketEventEffect(lastByType, "update-end-question", applySync, syncDeps)

  useSocketEventEffect(
    lastByType,
    "user-removed",
    () => {
      void queryClient.invalidateQueries({ queryKey: ["report-users", reportId] })
    },
    [queryClient, reportId],
  )
}
