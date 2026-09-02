"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import Spinner from "@/components/ui/spinner"
import PrizeLottie from "@/components/lottie/PrizeLottie"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import StatusEndQuestionRow from "./StatusEndQuestionRow"

import { cn } from "@/lib/utils"
import { formatQuizPoints, isNegativeQuizPoints, quizPointsToneClass } from "@/lib/quiz-points"
import { findPrizeEntryForUser, isRandomPrizeEntry } from "@/lib/report-prizes"
import { reportMyScore, reportUserTotalPoints, type IReportQuestionScore, type IReportUserPoints } from "@/api/reports"
import { useReportPrizesUsers } from "../hooks/use-report-prizes-users"

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
  if (rank === 1) {
    return "border-amber-300/50 bg-gradient-to-b from-amber-400/35 via-amber-500/15 to-amber-950/25 text-amber-50"
  }
  if (rank === 2) {
    return "border-slate-200/45 bg-gradient-to-b from-slate-200/28 via-slate-400/12 to-slate-950/30 text-slate-50"
  }
  if (rank === 3) {
    return "border-orange-400/45 bg-gradient-to-b from-orange-400/25 via-amber-800/12 to-amber-950/28 text-orange-50"
  }
  return "border-white/12 bg-white/[0.07] text-white/90"
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
    <div className="mt-4 space-y-4">
      {isRandomPrizeWinner ? (
        <div
          className="flex flex-col items-center gap-2 rounded-xl border border-emerald-300/35 bg-emerald-500/12 p-4 text-center text-emerald-50"
          role="status"
        >
          <PrizeLottie className="size-16 sm:size-20" />
          <p className="text-sm font-semibold xl:text-base">Вы получаете случайный приз!</p>
        </div>
      ) : null}
      {isPrizeWinner && myScore.rank != null ? (
        <div
          className="flex flex-col items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-500/18 p-4 text-center text-amber-50"
          role="status"
        >
          <PrizeLottie className="size-16 sm:size-20" />
          <p className="text-sm font-semibold xl:text-base">Вы получаете приз за {placeLabel(myScore.rank)}</p>
        </div>
      ) : null}
      {myScore.rank != null && (
        <div className={cn("flex flex-col items-center rounded-xl border px-5 py-4 text-center", rankPodiumClass(myScore.rank))}>
          <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-white/70 uppercase">Место</span>
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
          <p className="mt-2 text-xs leading-snug text-rose-200/85">Сумма ниже нуля — учтены штрафы стихий за ошибки и пропуски.</p>
        ) : null}
      </div>
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
    <p className="mt-4 text-sm text-white/55">Нет данных по очкам</p>
  )
}

UserScore.displayName = "UserScore"
export default UserScore
