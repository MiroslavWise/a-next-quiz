"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import Podium from "./Podium"
import Spinner from "@/components/ui/spinner"
import { ItemGroup } from "@/components/ui/item"
import StatusEndQuestionRow from "./StatusEndQuestionRow"
import ItemUserReportPoints from "@/components/report/ItemUser"

import { randomPrizeWinnerIds } from "@/lib/report-prizes"
import { getReportUserPoints, reportUserTotalPoints, type IReportQuestionScore } from "@/api/reports"
import { reportUserPointsQueryKey } from "../hooks/use-report-user-points"
import { useReportPrizesUsers } from "../hooks/use-report-prizes-users"

interface IProps {
  reportId: string | number
  tgId: number
  showLeaderboard: boolean
  prizes: number[]
  elementAvatarId?: number | null
}

function prizePlaceLabel(place: number) {
  if (place === 0) return `Случайный приз`
  return `${place} место`
}

function GeneralTable({ reportId, tgId, showLeaderboard, prizes, elementAvatarId }: IProps) {
  const { data: userPoints, isLoading: isLoadingUserPoints } = useQuery({
    queryKey: reportUserPointsQueryKey(reportId),
    enabled: !!reportId && !!tgId && showLeaderboard,
    queryFn: () => getReportUserPoints(reportId),
  })
  const { data: prizeWinners } = useReportPrizesUsers({ reportId })
  const randomWinners = useMemo(() => randomPrizeWinnerIds(prizeWinners), [prizeWinners])

  const sortedLeaderboard = useMemo(() => {
    if (!userPoints?.length) return []
    return userPoints
      .toSorted((a, b) => reportUserTotalPoints(b) - reportUserTotalPoints(a))
      .map((item, indexSorted) => ({ ...item, rank: item.rank ?? indexSorted + 1 }))
  }, [userPoints])

  const topThree = sortedLeaderboard.slice(0, 3)
  const restLeaderboard = sortedLeaderboard.slice(3)
  const sortedQuestions = (list?: IReportQuestionScore[]) => (list ?? []).toSorted((a, b) => a.index - b.index)

  if (isLoadingUserPoints)
    return (
      <div className="flex min-h-30 w-full items-center justify-center">
        <Spinner className="size-8 text-white/80" />
      </div>
    )

  return sortedLeaderboard.length > 0 ? (
    <div className="mt-4 flex w-full flex-col items-center justify-center gap-4 lg:max-h-[calc(100vh-14rem)] lg:min-h-0 lg:items-stretch lg:gap-6">
      {prizes.length > 0 ? (
        <p className="w-full text-center text-xs text-white/55">
          Призовые места:{" "}
          <span className="font-semibold text-amber-200/90">
            {prizes
              .toSorted((a, b) => a - b)
              .map(prizePlaceLabel)
              .join(", ")}
          </span>
        </p>
      ) : null}
      <div className="shrink-0">
        <Podium users={topThree} tgId={tgId} prizes={prizes} elementAvatarId={elementAvatarId} />
      </div>
      <div className="w-full lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        <ItemGroup className={prizes.length > 0 ? "space-y-4 pt-1 pl-1" : "space-y-4"}>
          {restLeaderboard.map((item) => {
            const place = item.rank ?? 0
            const isPrizePlace = place > 0 && prizes.includes(place)
            return (
              <div key={String(item.telegram_id)} className="space-y-2">
                <ItemUserReportPoints
                  {...item}
                  rank={place}
                  tgId={tgId}
                  points={reportUserTotalPoints(item)}
                  reducedEffects
                  reportId={reportId}
                  isPrizePlace={isPrizePlace}
                  isRandomPrize={randomWinners.has(Number(item.telegram_id))}
                />
                {item.questions?.length ? (
                  <ul className="ml-1 space-y-1.5 border-l border-white/15 pl-3">
                    {sortedQuestions(item.questions).map((q) => (
                      <li key={`${item.telegram_id}-${q.question_id}-${q.index}`}>
                        <StatusEndQuestionRow q={q} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )
          })}
        </ItemGroup>
      </div>
    </div>
  ) : (
    <p className="mt-4 text-sm text-white/55">Нет данных по очкам</p>
  )
}

GeneralTable.displayName = "GeneralTable"
export default GeneralTable
