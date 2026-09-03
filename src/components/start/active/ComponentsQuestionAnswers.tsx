"use client"

import { Suspense, lazy, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

const ItemSubAnswer = lazy(() => import("./ItemSubAnswer"))
const ItemButtonAnswer = lazy(() => import("./ItemButtonAnswer"))

import { cn } from "@/lib/utils"
import { getAuthTelegramId } from "@/lib/jwt"
import { isGetAnimeUser } from "@/lib/is-user"
import { type IAnswer } from "@/interface/answer"
import { indexToString } from "@/lib/index-to-string"
import { useElementThemeSession } from "@/stores/element-theme-session"
import { getReportsAnswersCorrectCounts, type IAnswerUserEntry, type IReportQuestionAnswerCounts } from "@/api/reports"

import styles from "../styles/optimal.module.scss"

const answerOptionGlassBase =
  "w-full rounded-xl border px-4 py-3 text-sm font-medium sm:px-5 sm:py-3.5 sm:text-base lg:text-lg xl:rounded-2xl xl:px-6 xl:py-4"

function leaderAnswerEndTintClass(isCorrect: boolean) {
  return isCorrect
    ? "border-emerald-200 bg-emerald-500 text-white ring-2 ring-emerald-300/90 [background-image:none]"
    : "border-white/12 bg-white/[0.07] text-white/45 grayscale [background-image:none] ring-0"
}

function playerAnswerEndTintClass(
  answerId: string,
  isCorrect: boolean,
  selectedAnswerId: string | null,
  userPickWasCorrect: boolean,
): string {
  const muted = "border-white/12 bg-white/[0.07] text-white/45 grayscale [background-image:none] ring-0"
  const brightCorrect = "border-emerald-200 bg-emerald-500 text-white ring-2 ring-emerald-300/90 [background-image:none]"
  const brightWrong = "border-rose-200 bg-rose-600 text-white ring-2 ring-rose-400/80 [background-image:none]"
  const softCorrect = "border-emerald-500/40 bg-emerald-400/20 text-emerald-100 [background-image:none] ring-0"

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
  const isGameAvatar = useElementThemeSession((s) => s.isGameAvatar)
  const avatarAnswerGlass = audience === "player" && isGameAvatar
  const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>(null)

  return (
    <Suspense
      fallback={
        <ul className={cn("flex w-full flex-col gap-2", styles.answers)}>
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="relative w-full rounded-xl px-4 py-3 text-sm font-medium text-transparent opacity-90 sm:px-5 sm:py-3.5 sm:text-base lg:text-lg xl:rounded-2xl xl:px-6 xl:py-4"
              data-index={i}
              aria-hidden
            >
              --||--
            </li>
          ))}
        </ul>
      }
    >
      <ul className="flex w-full flex-col gap-2">
        {renderedAnswers.map((answer, index: number) => {
          const isCorrect = !!answer?.check
          const isSelected = selectedAnswerId === answer.id
          const isSubmitting = submittingAnswerId === answer.id
          const str = cn(indexToString(index, { glass: avatarAnswerGlass }), "text-white")

          return (
            <li key={answer.id} className="relative w-full">
              {audience === "leader" ? (
                <ItemSubAnswer
                  str={str}
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
                  str={str}
                  id={answer.id}
                  results={results}
                  isAnime={isAnime}
                  isSelected={isSelected}
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
