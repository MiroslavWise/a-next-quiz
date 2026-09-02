"use client"

import { useMemo } from "react"

import Skeleton from "@/components/ui/skeleton"
import PrizeLottie from "@/components/lottie/PrizeLottie"
import { UserAvatarById } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import type { LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"

import { useReportUserPoints } from "../hooks/use-report-user-points"

const VISIBLE_LEADERS = 5
const LEADER_SKELETON_SLOTS = ["leader-skeleton-1", "leader-skeleton-2", "leader-skeleton-3", "leader-skeleton-4", "leader-skeleton-5", "leader-skeleton-overflow"] as const

interface MobileLeaderboardAvatarsProps {
  showDataPointsLeader: boolean
  reportId: string | number
  tgId: number
  lastByType: LastSocketEventByType<QuizEvent>
  prizes: number[]
  onOpen: () => void
}

function podiumBorderClass(rank: number) {
  if (rank === 1) return "border-amber-300/75 ring-2 ring-amber-400/35"
  if (rank === 2) return "border-slate-200/65 ring-2 ring-slate-300/30"
  if (rank === 3) return "border-orange-300/65 ring-2 ring-orange-400/30"
  return "border-white/20"
}

function avatarBorderClass(rank: number, isPrizePlace: boolean) {
  if (rank <= 3) return podiumBorderClass(rank)
  if (isPrizePlace) return "border-amber-400/55 ring-1 ring-amber-400/30"
  return "border-white/20"
}

function LeaderboardAvatarFace({
  telegramId,
  rank,
  isPrizePlace,
  tgId,
}: {
  telegramId: string | number
  rank: number
  isPrizePlace: boolean
  tgId: number
}) {
  const titleFallback = (id: number) => `Игрок ${id}`

  return (
    <div className="relative shrink-0">
      <UserAvatarById
        telegramId={typeof telegramId === "string" ? Number(telegramId) : telegramId}
        viewerTgId={tgId}
        variant="leaderboard"
        bare
        pseudoFallback={titleFallback}
        className={avatarBorderClass(rank, isPrizePlace)}
        loading={<Skeleton className="size-9 shrink-0 rounded-full border-2 border-white/15" />}
      />
      {isPrizePlace ? (
        <span
          className="absolute -top-1 -right-1 z-10 flex size-4.5 items-center justify-center rounded-full border border-amber-200/70 bg-linear-to-br from-amber-400 to-amber-600"
          aria-hidden
        >
          <PrizeLottie className="size-full" />
        </span>
      ) : null}
    </div>
  )
}

function MobileLeaderboardAvatars({ reportId, tgId, lastByType, prizes, onOpen, showDataPointsLeader }: MobileLeaderboardAvatarsProps) {
  const { sortedData, isLoading } = useReportUserPoints({ reportId, tgId, lastByType })

  const leaders = useMemo(() => sortedData.slice(0, VISIBLE_LEADERS), [sortedData])

  const totalCount = sortedData.length
  const overflow = Math.max(0, totalCount - leaders.length)

  if (!isLoading && totalCount === 0) return null

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "top-button-fixed fixed right-0 z-50 flex flex-col items-end rounded-l-3xl bg-(--accent-orb) p-1.5 transition-[opacity,transform] duration-300 ease-out md:hidden",
        showDataPointsLeader ? "pointer-events-none translate-x-full opacity-0" : "translate-x-0 opacity-100",
      )}
      aria-label="Открыть таблицу лидеров"
    >
      {isLoading ? (
        LEADER_SKELETON_SLOTS.slice(0, VISIBLE_LEADERS + (overflow ? 1 : 0)).map((slotKey, slotIndex) => (
          <Skeleton
            key={slotKey}
            className="size-9 shrink-0 rounded-full border-2 border-white/10"
            style={{ marginTop: slotIndex === 0 ? 0 : -10 }}
          />
        ))
      ) : (
        <div className="flex flex-col items-center">
          {leaders.map((item, index) => {
            const rank = index + 1
            const isPrizePlace = prizes.includes(rank)
            return (
              <div
                key={String(item.telegram_id)}
                className="relative shrink-0"
                style={{ marginTop: index === 0 ? 0 : -10, zIndex: leaders.length - index }}
              >
                <LeaderboardAvatarFace telegramId={item.telegram_id} rank={rank} isPrizePlace={isPrizePlace} tgId={tgId} />
              </div>
            )
          })}
          {overflow > 0 ? (
            <span
              className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-black/45 text-[0.65rem] font-bold text-white/85 tabular-nums ring-offset-1 ring-offset-black/50"
              style={{ marginTop: leaders.length > 0 ? -10 : 0, zIndex: 0 }}
              aria-hidden
            >
              +{overflow}
            </span>
          ) : null}
        </div>
      )}
    </button>
  )
}

MobileLeaderboardAvatars.displayName = "MobileLeaderboardAvatars"
export default MobileLeaderboardAvatars
