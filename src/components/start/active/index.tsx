"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState, Suspense, lazy, memo, type ReactNode } from "react"

import GameSkills from "./GameSkills"
import Skeleton from "@/components/ui/skeleton"
import StaffGameSkills from "./StaffGameSkills"
import type { IDotsQuestionsProps } from "./DotsQuestions"
const DotsQuestions = lazy(() => import("./DotsQuestions"))
const ActiveCharts = memo(lazy(() => import("./ActiveCharts")))
import ComponentsTitleQuestion from "./ComponentsTitleQuestion"
import { PairMateCard } from "./PairMateCard"
const DataPointsLeader = lazy(() => import("./DataPointsLeader"))
const LuckyBonusFloat = lazy(() => import("./LuckyBonusFloat"))
import type { IComponentWithRankProps } from "./ComponentWithRank"
import ComponentsQuestionAnswers from "./ComponentsQuestionAnswers"
const ComponentWithRank = memo(lazy(() => import("./ComponentWithRank")))
const MobileLeaderboardAvatars = lazy(() => import("./MobileLeaderboardAvatars"))
const LeaderNextQuestionFooter = lazy(() => import("./footer/LeaderNextQuestionFooter"))
import { ActiveChartsSkeleton, DefaultActiveSkeleton, LeaderNextQuestionFooterSkeleton, WithRankSkeleton } from "./Skeletons"

import ContextInfoSkill from "./ContextInfoSkill"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"
import { useQuizStaffSocketIO } from "@/hooks/useQuizStaffSocketIO"
import { type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import {
  GAME_PLAYER_COLUMN_CLASS,
  GAME_PLAYER_SHELL_CLASS,
  GAME_STAFF_COLUMN_CLASS,
  GAME_STAFF_SHELL_CLASS,
} from "@/components/start/lib/phase-shell"

import { useReportTeams } from "@/components/start/teams/use-report-teams"
import { pairColor, partnerTelegramId, teamOfMember } from "@/lib/report-teams"

import { useNextQuestion } from "../hooks/use-next-question"
import { useActiveQuestion } from "../hooks/use-active-question"
import { useShuffledAnswers } from "../hooks/use-shuffled-answers"
import { useSkillActivations } from "../hooks/use-skill-activations"
import { useMyPassedQuestions } from "../hooks/use-my-passed-questions"
import { useReportParticipation } from "../hooks/use-report-participation"
import { useActiveQuestionSync } from "../hooks/use-active-question-sync"
import { useAnswerRound, type AnswerRound, type IUseAnswerRoundParams } from "../hooks/use-answer-round"
import ComponentInfoSkill from "./ComponentInfoSkill"

interface IProps {
  reportId: string
  tgId: number
  user_id: number
  lastByType: LastSocketEventByType<QuizEvent>
  questions: any[]
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
  return <>{children(round)}</>
}

function LeaderTopSection({
  showDataPointsLeader,
  reportId,
  tgId,
  lastByType,
  prizes,
  onOpenDataPoints,
}: {
  showDataPointsLeader: boolean
  reportId: string
  tgId: number
  lastByType: LastSocketEventByType<QuizEvent>
  prizes: number[]
  onOpenDataPoints: () => void
}) {
  return (
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
  )
}

function PlayerResultsSection(props: IComponentWithRankProps) {
  return (
    <Suspense fallback={<WithRankSkeleton />}>
      <ComponentWithRank {...props} />
    </Suspense>
  )
}

function DotsQuestionsSection(props: IDotsQuestionsProps) {
  return (
    <Suspense
      fallback={
        <div
          className="absolute top-0 left-1/2 z-20 h-6 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/95 p-0.5"
          aria-hidden
        >
          <Skeleton className="size-full rounded-full" />
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
  const isStaff = isObserverLikeLeader
  const isPlayer = !isStaff
  const { data: teamsState } = useReportTeams({
    reportId,
    lastByType,
    enabled: isPlayer && !!reportId && !!tgId,
  })
  const myTeam = teamOfMember(teamsState?.teams, tgId)
  const mateId = partnerTelegramId(myTeam, tgId)
  const { lastByType: lastStaffByType } = useQuizStaffSocketIO({
    reportId,
    enabled: isStaff && !!reportId,
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
    isObserverLikeLeader: isStaff,
    isQuestionEnded,
  })
  useActiveQuestionSync({ lastByType, queryClient, activeQuestionQueryKey, reportId })

  const questionRoundKey = `${activeIndex}-${question?.id ?? ""}`
  const totalQuestions = questions?.length ?? 0

  if (isLoading || (isFetching && data?.status !== "END") || (isFetchingMyRole && !myRole && isAdminManager && !isLeader))
    return <DefaultActiveSkeleton />

  return (
    <ContextInfoSkill
      reportId={reportId}
      tgId={tgId}
      activeIndex={activeIndex}
      questionId={question?.id}
      audience={isStaff ? "staff" : "player"}
      bySkillId={bySkillId}
    >
      <ActiveQuestionRound
        key={questionRoundKey}
        activeIndex={activeIndex}
        lastByType={lastByType}
        lastStaffByType={lastStaffByType}
        reportId={reportId}
        question={question}
        statusQuestion={typeof statusQuestion === "string" ? statusQuestion : undefined}
        isObserverLikeLeader={isStaff}
        isFetchingMyRole={isFetchingMyRole}
        myRole={myRole}
        partnerTelegramId={isPlayer ? mateId : undefined}
        queryClient={queryClient}
        activeQuestionQueryKey={activeQuestionQueryKey}
      >
        {(round) => {
          const showStaffFooter = isLeader || (isObserver && collectingAnswers)

          return (
            <div className={isStaff ? GAME_STAFF_SHELL_CLASS : GAME_PLAYER_SHELL_CLASS}>
              <div className={isStaff ? GAME_STAFF_COLUMN_CLASS : GAME_PLAYER_COLUMN_CLASS}>
                {isStaff ? (
                  <LeaderTopSection
                    showDataPointsLeader={showDataPointsLeader}
                    reportId={reportId}
                    tgId={tgId}
                    lastByType={lastByType}
                    prizes={prizes}
                    onOpenDataPoints={() => setVisibleDataPointsLeader(true)}
                  />
                ) : null}
                {isPlayer ? (
                  <PairMateCard
                    reportId={reportId}
                    tgId={tgId}
                    lastByType={lastByType}
                    activeIndex={activeIndex}
                    isQuestionEnded={isQuestionEnded}
                  />
                ) : null}
                <ComponentsTitleQuestion
                  key={questionRoundKey}
                  {...question!}
                  start={data?.start}
                  time={question?.time ?? 0}
                  reportId={reportId}
                  tgId={tgId}
                  activeIndex={activeIndex}
                  ended={isQuestionEnded && isPlayer}
                  showTimer={!isQuestionEnded}
                  showMeta={isPlayer}
                  dots={
                    <DotsQuestionsSection
                      anchored
                      activeIndex={activeIndex + 1}
                      showResults={isPlayer}
                      myPassedQuestions={myPassedQuestions}
                      totalQuestions={totalQuestions}
                    />
                  }
                />
                {isQuestionEnded ? (
                  <Suspense fallback={<ActiveChartsSkeleton />}>
                    <ActiveCharts reportId={reportId} tgId={tgId} index={activeIndex} />
                  </Suspense>
                ) : null}
                {isStaff && (collectingAnswers || isQuestionEnded) ? (
                  <StaffGameSkills bySkillId={bySkillId} isQuestionEnded={isQuestionEnded} />
                ) : null}
                <ComponentsQuestionAnswers
                  tgId={tgId}
                  reportId={reportId}
                  activeIndex={activeIndex}
                  round={{
                    audience: isStaff ? "leader" : "player",
                    phase: isQuestionEnded ? "results" : "active",
                    playerCommitted: round.hasAnswered,
                    playerAwaitingRoleGate: isFetchingMyRole && !myRole,
                  }}
                  submittingAnswerId={round.submittingAnswerId}
                  selectedAnswerId={round.selectedAnswerId}
                  renderedAnswers={renderedAnswers}
                  handleAnswer={round.handleAnswer}
                  showLiveAnswerCounts={isStaff && collectingAnswers}
                  liveCountsByAnswerId={round.countsByAnswerId}
                  participantsTotal={participantsTotal}
                  partnerAnswerId={isPlayer ? round.partnerAnswerId : null}
                  pairColor={myTeam ? pairColor(myTeam.id) : undefined}
                />
                {isPlayer && isQuestionEnded ? (
                  <PlayerResultsSection reportId={reportId} tgId={tgId} activeIndex={activeIndex} />
                ) : null}
                {isPlayer && collectingAnswers && question?.id ? (
                  <GameSkills reportId={reportId} tgId={tgId} activeIndex={activeIndex} questionId={question.id} />
                ) : null}
                <div className={showStaffFooter ? "spacer-bottom-next" : "spacer-bottom-game"} aria-hidden />
              </div>
              {showStaffFooter ? (
                <Suspense fallback={<LeaderNextQuestionFooterSkeleton />}>
                  <LeaderNextQuestionFooter
                    canAdvance={isLeader}
                    onNext={goToNextQuestion}
                    actionBlocked={loading || isFetching || statusQuestion !== "END"}
                    showBusy={loading || isFetching}
                    isLastQuestionInQuiz={(data?.active_index ?? 0) === totalQuestions - 1}
                    activeIndex={activeIndex}
                    collectingAnswers={collectingAnswers}
                    answeredCount={round.answeredCount}
                    participantsTotal={participantsTotal}
                    answers={round.answeredUsers}
                    users={users}
                  />
                </Suspense>
              ) : null}
              {isStaff ? (
                <Suspense fallback={null}>
                  <DataPointsLeader
                    reportId={reportId}
                    tgId={tgId}
                    showDataPointsLeader={showDataPointsLeader}
                    setVisibleDataPointsLeader={setVisibleDataPointsLeader}
                    lastByType={lastByType}
                    prizes={prizes}
                    answeredUserIds={round.answeredUsers}
                    showAnswerOrder={collectingAnswers}
                    activeIndex={activeIndex}
                    answerProgressIndex={round.answersProgressForQuestion?.index}
                    isQuestionEnded={isQuestionEnded}
                    elementAvatarId={elementAvatarId}
                    totalQuestions={totalQuestions}
                  />
                </Suspense>
              ) : null}
            </div>
          )
        }}
      </ActiveQuestionRound>
      <ComponentInfoSkill />
      <Suspense fallback={null}>
        <LuckyBonusFloat lastByType={lastByType} tgId={tgId} activeIndex={activeIndex} isQuestionEnded={isQuestionEnded} />
      </Suspense>
    </ContextInfoSkill>
  )
}

ActiveQuestions.displayName = "ActiveQuestions"
export default ActiveQuestions
