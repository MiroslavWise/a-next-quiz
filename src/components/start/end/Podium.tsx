"use client"

import { useQuery } from "@tanstack/react-query"
import { MedalIcon, TrophyIcon } from "lucide-react"

import Skeleton from "@/components/ui/skeleton"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import PrizeLottie from "@/components/lottie/PrizeLottie"
import { UserAvatar } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import { reportUserTotalPoints, type IReportUserPoints } from "@/api/reports"

interface IProps {
  users: Array<IReportUserPoints & { rank: number }>
  tgId: number
  prizes: number[]
  elementAvatarId?: number | null
}

function rankCardClass(rank: 1 | 2 | 3) {
  if (rank === 1) return "border-amber-400/55 bg-amber-500/15 text-amber-100 shadow-amber-950/30"
  if (rank === 2) return "border-slate-200/45 bg-white/10 text-slate-100 shadow-slate-950/25"
  return "border-orange-500/45 bg-orange-500/15 text-orange-100 shadow-orange-950/25"
}

function rankAccentClass(rank: 1 | 2 | 3) {
  if (rank === 1) return "text-amber-300"
  if (rank === 2) return "text-slate-200"
  return "text-orange-300"
}

function isTopRank(rank: number): rank is 1 | 2 | 3 {
  return rank === 1 || rank === 2 || rank === 3
}

function PodiumUserCard({
  user,
  tgId,
  isPrizePlace,
  elementAvatarId,
}: {
  user: IReportUserPoints & { rank: 1 | 2 | 3 }
  tgId: number
  isPrizePlace: boolean
  elementAvatarId?: number | null
}) {
  const { data, isLoading } = useUserByTgId(user.telegram_id, { enabled: !!user.telegram_id && !!tgId })

  const pseudo = data?.pseudo?.trim() || `Пользователь ${user.telegram_id}`
  const score = reportUserTotalPoints(user)

  if (isLoading) {
    return (
      <div className={cn("min-w-0 rounded-2xl border px-4 py-3", rankCardClass(user.rank))}>
        <Skeleton className="mx-auto h-3 w-14 rounded-md" />
        <Skeleton className="mx-auto mt-2 size-9 rounded-full" />
        <Skeleton className="mx-auto mt-2 h-4 w-24 rounded-md" />
        <Skeleton className="mx-auto mt-2 h-4 w-20 rounded-md" />
      </div>
    )
  }

  const Icon = user.rank === 1 ? TrophyIcon : MedalIcon
  const isGameAvatar = elementAvatarId != null && Number(user.telegram_id) === elementAvatarId

  return (
    <article
      className={cn(
        "relative min-w-0 overflow-hidden rounded-2xl border px-4 py-3 text-center shadow-xl ring-1 ring-white/5",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-br before:from-white/14 before:via-transparent before:to-black/20",
        rankCardClass(user.rank),
      )}
    >
      <div className="relative z-10">
        <span className={cn("inline-flex items-center gap-1.5 text-[0.7rem] font-black tracking-wide", rankAccentClass(user.rank))}>
          <Icon className="size-3.5" aria-hidden />#{user.rank}
        </span>
        <div className="relative mx-auto mt-2 size-9">
          <UserAvatar
            avatar={data?.avatar}
            bg={data?.bg}
            pseudo={pseudo}
            photoUrl={data?.photo_url}
            element={data?.element}
            isGameAvatar={isGameAvatar}
            photoOverlay="never"
            className={cn("size-full rounded-full border-2", user.rank === 1 ? "border-amber-300/55" : "border-white/25")}
          />
          {isPrizePlace ? (
            <span
              className="absolute -top-1.5 -right-1.5 z-10 flex size-5 items-center justify-center rounded-full border border-amber-200/70 bg-linear-to-br from-amber-300 to-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.45)]"
              aria-label="Призовое место"
              title="Призовое место"
            >
              <PrizeLottie className="size-4" />
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-sm font-bold text-white/90" title={pseudo}>
          {pseudo}
        </p>
        <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm font-black text-white tabular-nums">
          <PickaxeIcon points={score} className={cn("size-3.5", rankAccentClass(user.rank))} />
          {score.toLocaleString("ru-RU")}
        </p>
      </div>
    </article>
  )
}

function Podium({ users, tgId, prizes, elementAvatarId }: IProps) {
  const topUsers = users
    .filter((user): user is IReportUserPoints & { rank: 1 | 2 | 3 } => isTopRank(user.rank))
    .toSorted((a, b) => a.rank - b.rank)

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/8 bg-[#111820]/92 shadow-2xl ring-1 shadow-black/35 ring-white/5">
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <TrophyIcon className="size-4 text-orange-300" aria-hidden />
        <h3 className="text-xs font-black tracking-[0.26em] text-white/45 uppercase">Рейтинг</h3>
      </div>
      <div
        className="grid gap-2 p-3"
        style={{
          gridTemplateColumns: `repeat(${Math.max(topUsers.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {topUsers.map((user) => (
          <PodiumUserCard
            key={String(user.telegram_id)}
            user={user}
            tgId={tgId}
            isPrizePlace={prizes.includes(user.rank)}
            elementAvatarId={elementAvatarId}
          />
        ))}
        {!topUsers.length ? <p className="px-1 py-2 text-sm text-white/55">Нет участников рейтинга</p> : null}
      </div>
    </div>
  )
}

Podium.displayName = "Podium"
export default Podium
