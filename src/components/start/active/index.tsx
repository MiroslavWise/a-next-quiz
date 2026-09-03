"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState, Suspense, lazy, memo, type ReactNode } from "react"

import Skeleton from "@/components/ui/skeleton"
import QuestionBonuses from "./QuestionBonuses"
import GameSkills from "./GameSkills"
import StaffGameSkills from "./StaffGameSkills"
import type { IDotsQuestionsProps } from "./DotsQuestions"
const DotsQuestions = lazy(() => import("./DotsQuestions"))
const ActiveCharts = memo(lazy(() => import("./ActiveCharts")))
import ComponentsTitleQuestion from "./ComponentsTitleQuestion"
const DataPointsLeader = lazy(() => import("./DataPointsLeader"))
const LuckyBonusFloat = lazy(() => import("./LuckyBonusFloat"))
import type { IComponentWithRankProps } from "./ComponentWithRank"
import ComponentsQuestionAnswers from "./ComponentsQuestionAnswers"
const ComponentWithRank = memo(lazy(() => import("./ComponentWithRank")))
const MobileLeaderboardAvatars = lazy(() => import("./MobileLeaderboardAvatars"))
const ObserverAnswersFooter = lazy(() => import("./footer/ObserverAnswersFooter"))
const LeaderNextQuestionFooter = lazy(() => import("./footer/LeaderNextQuestionFooter"))
import { ActiveChartsSkeleton, DefaultActiveSkeleton, LeaderNextQuestionFooterSkeleton, WithRankSkeleton } from "./Skeletons"

import { EReportStatus } from "@/enum/report"
import { type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"
import { useQuizStaffSocketIO } from "@/hooks/useQuizStaffSocketIO"

import { useElementThemeSession } from "@/stores/element-theme-session"

import { useActiveQuestion } from "../hooks/use-active-question"
import { useNextQuestion } from "../hooks/use-next-question"
import { useShuffledAnswers } from "../hooks/use-shuffled-answers"
import { useMyPassedQuestions } from "../hooks/use-my-passed-questions"
import { useReportParticipation } from "../hooks/use-report-participation"
import { useActiveQuestionSync } from "../hooks/use-active-question-sync"
import { useAnswerRound, type AnswerRound, type IUseAnswerRoundParams } from "../hooks/use-answer-round"
import { useSkillActivations } from "../hooks/use-skill-activations"

interface IProps {
  reportId: string
  tgId: number
  user_id: number
  lastByType: LastSocketEventByType<QuizEvent>
  questions: any[]
  status: EReportStatus
  prizes: number[]
  elementAvatarId?: number | null
}

interface ActiveQuestionRoundProps extends IUseAnswerRoundParams {
  children: (round: AnswerRound) => ReactNode
}

/**
 * Тонкая обёртка над `useAnswerRound`: монтируется с `key` по вопросу,
 * чтобы состояние раунда сбрасывалось при переходе к следующему вопросу.
 */
function ActiveQuestionRound({ children, ...params }: ActiveQuestionRoundProps) {
  const round = useAnswerRound(params)
  return children(round)
}

/**
 * Рендер верхней части для лидера: аватары и диаграммы
 */
function LeaderTopSection({
  showDataPointsLeader,
  activeIndex,
  isQuestionEnded,
  reportId,
  tgId,
  lastByType,
  prizes,
  question,
  onOpenDataPoints,
}: {
  showDataPointsLeader: boolean
  activeIndex: number
  isQuestionEnded: boolean
  reportId: string
  tgId: number
  lastByType: LastSocketEventByType<QuizEvent>
  prizes: number[]
  question: { id: string; title?: string; time?: number } | undefined
  onOpenDataPoints: () => void
}) {
  return (
    <>
      <Suspense fallback={null}>
        <MobileLeaderboardAvatars
          showDataPointsLeader={showDataPointsLeader}
          reportId={reportId}
          tgId={tgId}
          lastByType={lastByType}
          prizes={prizes}
          onOpen={onOpenDataPoints}
        />
      </Suspense>
      {isQuestionEnded && (
        <Suspense fallback={<ActiveChartsSkeleton />}>
          <ActiveCharts reportId={reportId} tgId={tgId} index={activeIndex} title={question?.title} />
        </Suspense>
      )}
    </>
  )
}

/**
 * Рендер результатов для игрока после окончания вопроса
 */
function PlayerResultsSection(props: IComponentWithRankProps) {
  return (
    <Suspense fallback={<WithRankSkeleton />}>
      <ComponentWithRank {...props} />
    </Suspense>
  )
}

function DotsQuestionsSection(props: IDotsQuestionsProps) {
  const isGameAvatar = useElementThemeSession((s) => s.isGameAvatar)
  return (
    <Suspense
      fallback={
        <div className="bg-background/95 absolute top-0 left-4 isolate z-10 flex -translate-y-1/2 items-center justify-center rounded-full p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_20px_rgba(0,0,0,0.24)]">
          <div
            className={
              isGameAvatar
                ? "flex max-w-full flex-row items-center gap-1.5 rounded-full border border-white/30 bg-white/18 px-2 py-1 shadow-lg shadow-black/20 backdrop-blur-md"
                : "flex max-w-full flex-row items-center gap-1.5 rounded-full border border-white/15 bg-(--accent-orb)/90 px-2 py-1 shadow-lg shadow-black/20 backdrop-blur-md"
            }
          >
            {Array.from({ length: props.totalQuestions }).map((_, index) => (
              <Skeleton key={index + "dots-questions-item" + "-skeleton"} className="size-2 rounded-full" />
            ))}
          </div>
        </div>
      }
    >
      <DotsQuestions {...props} />
    </Suspense>
  )
}

function ActiveQuestions({ reportId, tgId, user_id, lastByType, questions, prizes, elementAvatarId }: IProps) {
  const [showDataPointsLeader, setVisibleDataPointsLeader] = useState(false)

  const queryClient = useQueryClient()
  const {
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
  } = useActiveQuestion({ reportId, tgId })
  const { isAdminManager, isLeader, myRole, isFetchingMyRole, users, isObserver, isObserverLikeLeader, participantsTotal } =
    useReportParticipation({ reportId, tgId, user_id })
  const staffSocketEnabled = isObserverLikeLeader && !!reportId
  const { lastByType: lastStaffByType } = useQuizStaffSocketIO({
    reportId,
    enabled: staffSocketEnabled,
  })
  const { bySkillId } = useSkillActivations({
    lastStaffByType,
    activeIndex,
  })
  const renderedAnswers = useShuffledAnswers({ answers, questionId: question?.id, activeIndex, tgId })
  const { loading, goToNextQuestion } = useNextQuestion({ reportId, tgId, user_id, statusQuestion, isFetching })
  const { myPassedQuestions } = useMyPassedQuestions({
    reportId,
    tgId,
    isObserverLikeLeader,
    isQuestionEnded,
  })
  useActiveQuestionSync({ lastByType, queryClient, activeQuestionQueryKey, reportId })

  const questionRoundKey = `${activeIndex}-${question?.id ?? ""}`
  const show = isObserverLikeLeader && showDataPointsLeader

  const openDataPointsLeader = () => setVisibleDataPointsLeader(true)

  if (isLoading || (isFetching && data?.status !== "END") || (isFetchingMyRole && !myRole && isAdminManager && !isLeader))
    return <DefaultActiveSkeleton />

  return (
    <>
      <ActiveQuestionRound
        key={questionRoundKey}
        activeIndex={activeIndex}
        lastByType={lastByType}
        lastStaffByType={lastStaffByType}
        reportId={reportId}
        question={question}
        statusQuestion={typeof statusQuestion === "string" ? statusQuestion : undefined}
        isObserverLikeLeader={isObserverLikeLeader}
        isFetchingMyRole={isFetchingMyRole}
        myRole={myRole}
        queryClient={queryClient}
        activeQuestionQueryKey={activeQuestionQueryKey}
      >
        {(round) => {
          const showStaffBottomFooter = isLeader || (isObserver && collectingAnswers)

          return (
            <div className={isObserverLikeLeader ? "flex h-full min-h-0 w-full md:overflow-hidden" : "flex w-full"}>
              <div
                className={
                  isObserverLikeLeader
                    ? "relative flex h-full min-h-0 w-full min-w-0 flex-col gap-2 overflow-y-auto overscroll-contain px-4 pt-12 [-webkit-overflow-scrolling:touch] md:w-2/3 md:pr-2"
                    : "relative flex h-full w-full flex-col gap-2 px-4 pt-12"
                }
              >
                <div className="relative w-full">
                  <DotsQuestionsSection
                    activeIndex={activeIndex + 1}
                    showResults={!isObserverLikeLeader}
                    myPassedQuestions={myPassedQuestions}
                    totalQuestions={questions?.length ?? 0}
                  />
                  {isObserverLikeLeader ? (
                    <Suspense fallback={null}>
                      <LeaderTopSection
                        showDataPointsLeader={showDataPointsLeader}
                        activeIndex={activeIndex}
                        isQuestionEnded={isQuestionEnded}
                        reportId={reportId}
                        tgId={tgId}
                        lastByType={lastByType}
                        prizes={prizes}
                        question={question}
                        onOpenDataPoints={openDataPointsLeader}
                      />
                    </Suspense>
                  ) : null}
                  {statusQuestion === "GAME" && (
                    <ComponentsTitleQuestion {...question!} start={data?.start} time={question?.time ?? 0} />
                  )}
                  {isQuestionEnded && !isObserverLikeLeader && (
                    <PlayerResultsSection reportId={reportId} tgId={tgId} activeIndex={activeIndex} />
                  )}
                  <QuestionBonuses bonuses={question?.bonuses} />
                </div>
                {!isObserverLikeLeader && statusQuestion === "GAME" && question?.id ? (
                  <GameSkills reportId={reportId} tgId={tgId} activeIndex={activeIndex} questionId={question.id} />
                ) : null}
                {isObserverLikeLeader && (statusQuestion === "GAME" || statusQuestion === "END") ? (
                  <StaffGameSkills bySkillId={bySkillId} tgId={tgId} isQuestionEnded={isQuestionEnded} />
                ) : null}
                <ComponentsQuestionAnswers
                  tgId={tgId}
                  reportId={reportId}
                  activeIndex={activeIndex}
                  round={{
                    audience: isObserverLikeLeader ? "leader" : "player",
                    phase: isQuestionEnded ? "results" : "active",
                    playerCommitted: round.hasAnswered,
                    playerAwaitingRoleGate: isFetchingMyRole && !myRole,
                  }}
                  submittingAnswerId={round.submittingAnswerId}
                  selectedAnswerId={round.selectedAnswerId}
                  renderedAnswers={renderedAnswers}
                  handleAnswer={round.handleAnswer}
                  showLiveAnswerCounts={isObserverLikeLeader && collectingAnswers}
                  liveCountsByAnswerId={round.countsByAnswerId}
                  participantsTotal={participantsTotal}
                />
                {/* Spacer в потоке скролла: padding-bottom на flex часто не даёт прокрутку в WebView. */}
                {showStaffBottomFooter ? <div className="spacer-bottom-next" aria-hidden /> : null}
              </div>
              {isLeader ? (
                <Suspense fallback={<LeaderNextQuestionFooterSkeleton />}>
                  <LeaderNextQuestionFooter
                    onNext={goToNextQuestion}
                    actionBlocked={loading || isFetching || statusQuestion !== "END"}
                    showBusy={loading || isFetching}
                    isLastQuestionInQuiz={(data?.active_index ?? 0) === (questions?.length ?? 0) - 1}
                    activeIndex={activeIndex}
                    collectingAnswers={collectingAnswers}
                    answeredCount={round.answeredCount}
                    participantsTotal={participantsTotal}
                    answers={round.answeredUsers}
                    users={users}
                  />
                </Suspense>
              ) : null}
              {isObserver && collectingAnswers ? (
                <Suspense fallback={<LeaderNextQuestionFooterSkeleton />}>
                  <ObserverAnswersFooter
                    answeredCount={round.answeredCount}
                    participantsTotal={participantsTotal}
                    answers={round.answeredUsers}
                    users={users}
                  />
                </Suspense>
              ) : null}
              {isObserverLikeLeader && (
                <Suspense fallback={null}>
                  <DataPointsLeader
                    reportId={reportId!}
                    tgId={tgId!}
                    showDataPointsLeader={show}
                    setVisibleDataPointsLeader={setVisibleDataPointsLeader}
                    lastByType={lastByType}
                    prizes={prizes}
                    answeredUserIds={round.answeredUsers}
                    showAnswerOrder={collectingAnswers}
                    activeIndex={activeIndex}
                    answerProgressIndex={round.answersProgressForQuestion?.index}
                    isQuestionEnded={isQuestionEnded}
                    elementAvatarId={elementAvatarId}
                    totalQuestions={questions?.length ?? 0}
                  />
                </Suspense>
              )}
            </div>
          )
        }}
      </ActiveQuestionRound>
      <Suspense fallback={null}>
        <LuckyBonusFloat lastByType={lastByType} tgId={tgId} activeIndex={activeIndex} isQuestionEnded={isQuestionEnded} />
      </Suspense>
    </>
  )
}

ActiveQuestions.displayName = "ActiveQuestions"
export default ActiveQuestions
