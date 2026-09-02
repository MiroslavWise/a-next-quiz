"use client"

import { useCallback, useMemo, useReducer, useRef, useState } from "react"
import { type QueryClient } from "@tanstack/react-query"

import { ApiRequestError } from "@/api/errors"
import { answerQuestion } from "@/api/reports"
import { latestSocketEventOfTypes, useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"
import type { CountAnswersUsers, QuizStaffEvent } from "@/hooks/useQuizStaffSocketIO"
import { parseOptionalTelegramId } from "@/lib/normalize"

import { isActiveIndexSnapshot } from "./use-active-question-sync"

const syncActiveIndexMessageTypes = ["start", "next-question", "update-next-question", "end-question", "update-end-question"] as const

function shouldResetAnswersProgress(lastMessage: unknown): boolean {
  if (!lastMessage || typeof lastMessage !== "object") return false
  const msg = lastMessage as { type?: string; status?: string; data?: unknown }
  const type = msg.type
  if (!type || !syncActiveIndexMessageTypes.includes(type as (typeof syncActiveIndexMessageTypes)[number])) return false
  if (type === "start" && msg.status !== "GAME") return false
  return isActiveIndexSnapshot(msg.data)
}

type RoundUiState = {
  selectedAnswerId: string | null
  submittingAnswerId: string | null
  hasAnswered: boolean
}

const initialRoundUi: RoundUiState = {
  selectedAnswerId: null,
  submittingAnswerId: null,
  hasAnswered: false,
}

type RoundUiAction =
  | { type: "answerSubmitStart"; answerId: string }
  | { type: "answerSubmitEnd" }
  | { type: "answerSuccess" }
  | { type: "answerErrorClearSelection" }
  | { type: "answerAlreadyAnswered" }

function roundUiReducer(state: RoundUiState, action: RoundUiAction): RoundUiState {
  switch (action.type) {
    case "answerSubmitStart":
      return { ...state, submittingAnswerId: action.answerId, selectedAnswerId: action.answerId }
    case "answerSubmitEnd":
      return { ...state, submittingAnswerId: null }
    case "answerSuccess":
      return { ...state, hasAnswered: true }
    case "answerErrorClearSelection":
      return { ...state, selectedAnswerId: null }
    case "answerAlreadyAnswered":
      return { ...state, hasAnswered: true }
    default:
      return state
  }
}

export type AnswersProgress = {
  index: number
  /** telegram_id → answer_id */
  users: CountAnswersUsers
  /** Кто уже ответил, в порядке первого появления в снапшотах. */
  answeredUserIds: number[]
  time: number
} | null

export interface AnswerRound {
  selectedAnswerId: string | null
  submittingAnswerId: string | null
  hasAnswered: boolean
  handleAnswer: (answerId: string, index: number) => Promise<void>
  answeredCount: number
  answersProgressForQuestion: AnswersProgress
  answeredUsers: number[]
  countsByAnswerId: Map<string, number>
}

/** Словарь `count-answers.users`; иначе `null` (неверный payload). */
export function parseCountAnswersUsers(users: unknown): CountAnswersUsers | null {
  if (!users || typeof users !== "object" || Array.isArray(users)) return null
  const out: CountAnswersUsers = {}
  for (const [key, value] of Object.entries(users)) {
    if (typeof value !== "string" || value.length === 0) continue
    const telegramId = parseOptionalTelegramId(key)
    if (telegramId == null) continue
    out[String(telegramId)] = value
  }
  return out
}

function mergeFirstSeenOrder(prevIds: number[], users: CountAnswersUsers): number[] {
  const current = new Set<number>()
  for (const key of Object.keys(users)) {
    const id = parseOptionalTelegramId(key)
    if (id != null) current.add(id)
  }
  const next: number[] = []
  const seen = new Set<number>()
  for (const id of prevIds) {
    if (!current.has(id) || seen.has(id)) continue
    next.push(id)
    seen.add(id)
  }
  for (const id of current) {
    if (seen.has(id)) continue
    next.push(id)
    seen.add(id)
  }
  return next
}

function countsByAnswerIdFromUsers(users: CountAnswersUsers | undefined): Map<string, number> {
  const map = new Map<string, number>()
  if (!users) return map
  for (const answerId of Object.values(users)) {
    if (!answerId) continue
    map.set(answerId, (map.get(answerId) ?? 0) + 1)
  }
  return map
}

export interface IUseAnswerRoundParams {
  activeIndex: number
  lastByType: LastSocketEventByType<QuizEvent>
  lastStaffByType: LastSocketEventByType<QuizStaffEvent>
  reportId: string
  question: { id: string; time?: number } | undefined
  statusQuestion: string | undefined
  isObserverLikeLeader: boolean
  isFetchingMyRole: boolean
  myRole: { role: string } | undefined
  queryClient: QueryClient
  activeQuestionQueryKey: readonly ["active-questions", string]
}

/**
 * Состояние одного раунда вопроса для игрока: выбранный/отправляемый ответ, факт ответа,
 * прогресс сбора ответов (для ведущего) и обработчик отправки ответа.
 *
 * Важно: предполагается монтирование с `key` по вопросу — так состояние раунда
 * сбрасывается при переходе к следующему вопросу.
 */
export function useAnswerRound({
  activeIndex,
  lastByType,
  lastStaffByType,
  reportId,
  question,
  statusQuestion,
  isObserverLikeLeader,
  isFetchingMyRole,
  myRole,
  queryClient,
  activeQuestionQueryKey,
}: IUseAnswerRoundParams): AnswerRound {
  const [answersProgress, setAnswersProgress] = useState<AnswersProgress>(null)
  const [roundUi, dispatchRound] = useReducer(roundUiReducer, initialRoundUi)
  const { selectedAnswerId, submittingAnswerId, hasAnswered } = roundUi
  const latestSyncEvent = latestSocketEventOfTypes(lastByType, syncActiveIndexMessageTypes)
  const latestSyncEventRef = useRef(latestSyncEvent)
  const answersProgressSyncGenerationRef = useRef(0)
  const [answersProgressClearedAt, setAnswersProgressClearedAt] = useState(0)

  if (latestSyncEvent !== latestSyncEventRef.current) {
    latestSyncEventRef.current = latestSyncEvent
    if (shouldResetAnswersProgress(latestSyncEvent)) {
      answersProgressSyncGenerationRef.current += 1
    }
  }

  if (answersProgressSyncGenerationRef.current > answersProgressClearedAt) {
    setAnswersProgressClearedAt(answersProgressSyncGenerationRef.current)
    if (answersProgress !== null) setAnswersProgress(null)
  }

  const answersProgressForQuestion = answersProgress != null && answersProgress.index === activeIndex ? answersProgress : null
  const answeredUsers = answersProgressForQuestion?.answeredUserIds ?? []
  const answeredCount = answeredUsers.length
  const countsByAnswerId = useMemo(
    () => countsByAnswerIdFromUsers(answersProgressForQuestion?.users),
    [answersProgressForQuestion?.users],
  )

  useSocketEventEffect(
    lastStaffByType,
    "count-answers",
    (msg) => {
      const idx = msg.index
      const users = parseCountAnswersUsers(msg.users)
      const time = msg.time
      if (typeof idx !== "number" || users == null || typeof time !== "number") return
      if (idx !== activeIndex) return

      setAnswersProgress((prev) => {
        if (prev?.index === idx && time <= prev.time) return prev
        const answeredUserIds = mergeFirstSeenOrder(prev?.index === idx ? prev.answeredUserIds : [], users)
        return { index: idx, users, answeredUserIds, time }
      })
    },
    [activeIndex],
  )

  // Обёрнута в useCallback для стабилизации и предотвращения ненужных переходов у дочерних компонент
  const handleAnswer = useCallback(
    async (answerId: string, index: number) => {
      if (isObserverLikeLeader) return
      if (statusQuestion !== "GAME") return
      if (hasAnswered || submittingAnswerId) return
      if (isFetchingMyRole && !myRole) return

      dispatchRound({ type: "answerSubmitStart", answerId })
      try {
        const res = await answerQuestion(reportId, {
          index,
          questionId: question?.id!,
          answerId,
        })
        if (res) {
          dispatchRound({ type: "answerSuccess" })
          void queryClient.invalidateQueries({ queryKey: ["rank", reportId] })
        }
      } catch (error) {
        if (ApiRequestError.is(error) && error.code === "already_answered") {
          dispatchRound({ type: "answerAlreadyAnswered" })
          queryClient.invalidateQueries({ queryKey: activeQuestionQueryKey, exact: true })
          return
        }
        console.error(error)
        dispatchRound({ type: "answerErrorClearSelection" })
      } finally {
        dispatchRound({ type: "answerSubmitEnd" })
      }
    },
    [
      isObserverLikeLeader,
      statusQuestion,
      hasAnswered,
      submittingAnswerId,
      isFetchingMyRole,
      myRole,
      reportId,
      question?.id,
      queryClient,
      activeQuestionQueryKey,
    ],
  )

  return {
    selectedAnswerId,
    submittingAnswerId,
    hasAnswered,
    handleAnswer,
    answeredCount,
    answersProgressForQuestion,
    answeredUsers,
    countsByAnswerId,
  }
}
