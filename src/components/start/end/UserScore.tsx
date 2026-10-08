"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import Spinner from "@/components/ui/spinner"
import PrizeLottie from "@/components/lottie/PrizeLottie"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import StatusEndQuestionRow from "./StatusEndQuestionRow"
import { MatchTitleSeals } from "@/components/report/MatchTitleSeals"

import { cn } from "@/lib/utils"
import { formatQuizPoints, isNegativeQuizPoints, quizPointsToneClass } from "@/lib/quiz-points"
import { findPrizeEntryForUser, isRandomPrizeEntry } from "@/lib/report-prizes"
import { reportMyScore, reportUserTotalPoints, type IReportQuestionScore, type IReportUserPoints } from "@/api/reports"
import { useReportPrizesUsers } from "../hooks/use-report-prizes-users"
import { useReportTeams } from "@/components/start/teams/use-report-teams"
import { partnerTelegramId, teamOfMember } from "@/lib/report-teams"
import { useUserByTgId } from "@/queries/user"

interface IProps {
  reportId: string | number
  tgId: number
  isLeader: boolean
  isObserver: boolean
  prizes: number[]
}

function placeLabel(rank: number) {
  return `${rank}-е место`
}

function rankPodiumClass(rank: number) {
  if (rank === 1) return "glass-start-slab-selected"
  return ""
}

function normalizeMyScore(raw: IReportUserPoints | number | undefined | null): IReportUserPoints | null {
  if (raw == null) return null
  if (typeof raw === "number") {
    return { telegram_id: "", total_points: raw, points: raw, questions: [] }
  }
  return raw
}

function UserScore({ reportId, tgId, isLeader, isObserver, prizes }: IProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-my-score", reportId],
    queryFn: () => reportMyScore(reportId),
    enabled: !!reportId && !!tgId && !isLeader && !isObserver,
  })
  const { data: prizeWinners, isLoading: isLoadingPrizeWinners } = useReportPrizesUsers({ reportId })
  const { data: teamsState } = useReportTeams({ reportId, enabled: !!reportId && !!tgId && !isLeader && !isObserver })
  const myPartnerId = partnerTelegramId(teamOfMember(teamsState?.teams, tgId), tgId)
  const { data: partner } = useUserByTgId(myPartnerId ?? 0, { enabled: !!myPartnerId })

  const myScore = useMemo(() => normalizeMyScore(data), [data])
  const myPrizeEntry = useMemo(() => findPrizeEntryForUser(prizeWinners, tgId), [prizeWinners, tgId])
  const sortedQuestions = (list?: IReportQuestionScore[]) => (list ?? []).toSorted((a, b) => a.index - b.index)
  const isRankedPrizeWinner = myPrizeEntry != null && myPrizeEntry.place > 0
  const isRandomPrizeWinner = myPrizeEntry != null && isRandomPrizeEntry(myPrizeEntry)
  const isPrizeWinnerFallback = myScore?.rank != null && myScore.rank > 0 && prizes.includes(myScore.rank)
  const isPrizeWinner = isRankedPrizeWinner || (!prizeWinners && isPrizeWinnerFallback)
  const totalPoints = myScore ? reportUserTotalPoints(myScore) : 0

  if (isLoading || isLoadingPrizeWinners)
    return (
      <div className="flex min-h-30 w-full items-center justify-center">
        <Spinner className="size-8 text-white/80" />
      </div>
    )

  return myScore ? (
    <div className="space-y-4">
      {isRandomPrizeWinner ? (
        <div className="glass-start-slab-faithful flex flex-col items-center gap-2 rounded-2xl p-4 text-center text-white" role="status">
          <PrizeLottie className="size-16 sm:size-20" />
          <p className="text-sm font-semibold xl:text-base">Вы получаете случайный приз!</p>
        </div>
      ) : null}
      {isPrizeWinner && myScore.rank != null ? (
        <div className="glass-start-slab-selected flex flex-col items-center gap-2 rounded-2xl p-4 text-center text-white" role="status">
          <PrizeLottie className="size-16 sm:size-20" />
          <p className="text-sm font-semibold xl:text-base">Вы получаете приз за {placeLabel(myScore.rank)}</p>
        </div>
      ) : null}
      {myScore.rank != null && (
        <div
          className={cn(
            "glass-start-slab relative flex flex-col items-center rounded-2xl px-5 py-4 text-center has-aria-expanded:z-30",
            rankPodiumClass(myScore.rank),
          )}
        >
          <MatchTitleSeals titles={myScore.titles} />
          <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-(--accent-orb)/85 uppercase">Место</span>
          <span className="mt-1 text-5xl leading-none font-black tabular-nums">{myScore.rank}</span>
          <span className="mt-2 text-sm font-semibold text-white/85">{placeLabel(myScore.rank)}</span>
        </div>
      )}
      <div className="text-center">
        <div className="mt-1 inline-grid grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-1">
          <p className={cn("text-4xl font-bold tabular-nums", quizPointsToneClass(totalPoints))}>{formatQuizPoints(totalPoints)}</p>
          <PickaxeIcon points={totalPoints} className="size-5 shrink-0" />
        </div>
        {isNegativeQuizPoints(totalPoints) ? (
          <p className="mt-2 text-xs leading-snug text-rose-200/85">Сумма ниже нуля — учтены отрицательные эффекты недостатков стихий.</p>
        ) : null}
      </div>
      {myPartnerId ? (
        <p className="text-center text-sm text-white/80" role="status">
          Пара: <span className="font-semibold text-white">{partner?.pseudo?.trim() || `Участник ${myPartnerId}`}</span>
        </p>
      ) : null}
      {myScore.rank == null && (myScore.titles?.length ?? 0) > 0 ? (
        <div className="glass-start-slab relative min-h-10 rounded-2xl has-aria-expanded:z-30">
          <MatchTitleSeals titles={myScore.titles} />
        </div>
      ) : null}
      {myScore.questions && myScore.questions.length > 0 ? (
        <ul className="space-y-2" aria-label="Результаты по вопросам">
          {sortedQuestions(myScore.questions).map((q) => (
            <li key={`${q.question_id}-${q.index}`}>
              <StatusEndQuestionRow q={q} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  ) : (
    <p className="text-sm text-white/55">Нет данных по очкам</p>
  )
}

UserScore.displayName = "UserScore"
export default UserScore
