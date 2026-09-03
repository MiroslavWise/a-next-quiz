"use client"

import { Suspense, lazy, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

const ItemSubAnswer = lazy(() => import("./ItemSubAnswer"))
const ItemButtonAnswer = lazy(() => import("./ItemButtonAnswer"))

import { cn } from "@/lib/utils"
import { getAuthTelegramId } from "@/lib/jwt"
import { isGetAnimeUser } from "@/lib/is-user"
import { type IAnswer } from "@/interface/answer"
import { getReportsAnswersCorrectCounts, type IAnswerUserEntry, type IReportQuestionAnswerCounts } from "@/api/reports"

const answerOptionGlassBase =
  "glass-start-slab w-full rounded-2xl px-3.5 py-3 text-sm font-medium sm:px-5 sm:py-3.5 sm:text-base lg:text-lg"

function leaderAnswerEndTintClass(isCorrect: boolean) {
  return isCorrect ? "glass-start-slab-faithful text-white" : "glass-start-slab-muted"
}

function playerAnswerEndTintClass(
  answerId: string,
  isCorrect: boolean,
  selectedAnswerId: string | null,
  userPickWasCorrect: boolean,
): string {
  const muted = "glass-start-slab-muted"
  const brightCorrect = "glass-start-slab-faithful text-white"
  const brightWrong = "glass-start-slab-unfaithful text-white"
  const softCorrect = "border-faithful/40 bg-faithful/15 text-faithful"

  if (!selectedAnswerId) {
    return isCorrect ? softCorrect : muted
  }

  if (answerId === selectedAnswerId) {
    return isCorrect ? brightCorrect : brightWrong
  }

  if (isCorrect && !userPickWasCorrect) {
    return softCorrect
  }

  return muted
}

type AnswersAudience = "leader" | "player"

/** Состояние раунда одним объектом вместо нескольких булевых пропсов у контейнера */
interface QuizAnswersRoundState {
  audience: AnswersAudience
  phase: "active" | "results"
  /** Игрок уже отправил ответ на текущий вопрос */
  playerCommitted: boolean
  /** Игрок: кнопки ждут загрузку роли с бэка */
  playerAwaitingRoleGate: boolean
}

interface IProps {
  activeIndex: number
  selectedAnswerId: string | null
  submittingAnswerId: string | null
  renderedAnswers: IAnswer[]
  tgId: number
  reportId: string
  handleAnswer: (answerId: string, index: number) => Promise<void>
  round: QuizAnswersRoundState
  /** LIVE-счётчики из `count-answers` (лидер/наблюдатель, фаза GAME). */
  showLiveAnswerCounts?: boolean
  liveCountsByAnswerId?: Map<string, number>
  participantsTotal?: number
}

function getCountFunction(answersCorrectCounts: IReportQuestionAnswerCounts["responses"], participantsTotal: number) {
  if (!answersCorrectCounts?.length || participantsTotal <= 0) {
    return () => 0
  }

  return (answerId: string) => {
    const answer = answersCorrectCounts.find((a) => a.answer_id === answerId)
    const raw = (answer?.count ?? 0) / participantsTotal
    return Math.min(1, Math.max(0, raw))
  }
}

function usersByAnswerId(responses: IReportQuestionAnswerCounts["responses"] | undefined): Map<string, IAnswerUserEntry[]> {
  const map = new Map<string, IAnswerUserEntry[]>()
  for (const row of responses ?? []) {
    map.set(row.answer_id, row.users ?? [])
  }
  return map
}

/** Отдельный mount при смене `key` — сброс состояния списка при смене вопроса/набора ответов. */
function AnswerOptionsList({
  activeIndex,
  audience,
  phase,
  playerInputsLocked,
  playerHasSubmittedThisRound,
  renderedAnswers,
  selectedAnswerId,
  submittingAnswerId,
  handleAnswer,
  getCount,
  userPickWasCorrect,
  answerersByAnswerId,
  viewerTgId,
  showLiveAnswerCounts = false,
  liveCountsByAnswerId,
  participantsTotal = 0,
}: {
  activeIndex: number
  audience: AnswersAudience
  phase: "active" | "results"
  playerInputsLocked: boolean
  /** Игрок уже отправил ответ на текущий вопрос (для подписи у выбранного варианта) */
  playerHasSubmittedThisRound: boolean
  renderedAnswers: IAnswer[]
  selectedAnswerId: string | null
  submittingAnswerId: string | null
  handleAnswer: (answerId: string, index: number) => Promise<void>
  getCount: (answerId: string) => number
  userPickWasCorrect: boolean
  answerersByAnswerId: Map<string, IAnswerUserEntry[]>
  viewerTgId: number
  showLiveAnswerCounts?: boolean
  liveCountsByAnswerId?: Map<string, number>
  participantsTotal?: number
}) {
  const tgId = getAuthTelegramId()
  const results = phase === "results"
  const isAnime = isGetAnimeUser(tgId)
  const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>(null)

  return (
    <Suspense
      fallback={
        <ul className={cn("flex w-full flex-col gap-2")}>
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="glass-start-slab relative w-full rounded-2xl px-3.5 py-3 text-sm font-medium text-transparent opacity-90 sm:px-5 sm:py-3.5 sm:text-base lg:text-lg"
              aria-hidden
            >
              --||--
            </li>
          ))}
        </ul>
      }
    >
      <ul className="flex w-full flex-col gap-2">
        {renderedAnswers.map((answer) => {
          const isCorrect = !!answer?.check
          const isSelected = selectedAnswerId === answer.id
          const isSubmitting = submittingAnswerId === answer.id

          return (
            <li key={answer.id} className="relative w-full">
              {audience === "leader" ? (
                <ItemSubAnswer
                  id={answer.id}
                  results={results}
                  getCount={getCount}
                  description={answer.description}
                  liveCount={showLiveAnswerCounts ? (liveCountsByAnswerId?.get(answer.id) ?? 0) : null}
                  participantsTotal={participantsTotal}
                  answerOptionGlassBase={answerOptionGlassBase}
                  endTintClass={leaderAnswerEndTintClass(isCorrect)}
                  answerers={answerersByAnswerId.get(answer.id) ?? []}
                  viewerTgId={viewerTgId}
                  isCorrectAnswer={isCorrect}
                  stackExpanded={expandedAnswerId === answer.id}
                  onStackExpandedChange={(open) => setExpandedAnswerId(open ? answer.id : null)}
                />
              ) : (
                <ItemButtonAnswer
                  id={answer.id}
                  results={results}
                  isAnime={isAnime}
                  isSelected={isSelected}
                  isCorrect={isCorrect}
                  activeIndex={activeIndex}
                  isSubmitting={isSubmitting}
                  handleAnswer={handleAnswer}
                  description={answer.description}
                  playerInputsLocked={playerInputsLocked}
                  answerOptionGlassBase={answerOptionGlassBase}
                  playerHasSubmittedThisRound={playerHasSubmittedThisRound}
                  endTintClass={playerAnswerEndTintClass(answer.id, isCorrect, selectedAnswerId, userPickWasCorrect)}
                />
              )}
            </li>
          )
        })}
      </ul>
    </Suspense>
  )
}

function ComponentsQuestionAnswers({
  activeIndex,
  renderedAnswers,
  selectedAnswerId,
  submittingAnswerId,
  handleAnswer,
  tgId,
  reportId,
  round,
  showLiveAnswerCounts = false,
  liveCountsByAnswerId,
  participantsTotal = 0,
}: IProps) {
  const { audience, phase, playerCommitted, playerAwaitingRoleGate } = round

  const { data: answersCorrectCounts } = useQuery({
    queryFn: () => getReportsAnswersCorrectCounts(reportId, activeIndex),
    queryKey: ["report-answers-correct-counts", tgId, reportId, activeIndex],
    enabled: !!tgId && audience === "leader" && phase === "results",
  })

  const resultsGetCount = getCountFunction(answersCorrectCounts?.responses ?? [], answersCorrectCounts?.participants_total ?? 0)
  const liveGetCount = useMemo(() => {
    return (answerId: string) => {
      if (participantsTotal <= 0) return 0
      const raw = (liveCountsByAnswerId?.get(answerId) ?? 0) / participantsTotal
      return Math.min(1, Math.max(0, raw))
    }
  }, [liveCountsByAnswerId, participantsTotal])
  const getCount = showLiveAnswerCounts ? liveGetCount : resultsGetCount
  const answerersByAnswerId = useMemo(() => usersByAnswerId(answersCorrectCounts?.responses), [answersCorrectCounts?.responses])
  const userPickWasCorrect = selectedAnswerId ? !!renderedAnswers.find((a) => a.id === selectedAnswerId)?.check : false

  const playerInputsLocked = playerAwaitingRoleGate || playerCommitted || !!submittingAnswerId || phase === "results"

  const listKey = `${activeIndex}-${renderedAnswers.map((a) => a.id).join(",")}`

  return (
    <AnswerOptionsList
      key={listKey}
      activeIndex={activeIndex}
      audience={audience}
      phase={phase}
      playerInputsLocked={playerInputsLocked}
      playerHasSubmittedThisRound={playerCommitted}
      renderedAnswers={renderedAnswers}
      selectedAnswerId={selectedAnswerId}
      submittingAnswerId={submittingAnswerId}
      handleAnswer={handleAnswer}
      getCount={getCount}
      userPickWasCorrect={userPickWasCorrect}
      answerersByAnswerId={answerersByAnswerId}
      viewerTgId={tgId}
      showLiveAnswerCounts={showLiveAnswerCounts}
      liveCountsByAnswerId={liveCountsByAnswerId}
      participantsTotal={participantsTotal}
    />
  )
}

ComponentsQuestionAnswers.displayName = "ComponentsQuestionAnswers"
export default ComponentsQuestionAnswers
