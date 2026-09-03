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
  if (rank === 1) return "glass-start-slab glass-start-slab-selected"
  return "glass-start-slab"
}

function rankAccentClass(rank: 1 | 2 | 3) {
  if (rank === 1) return "text-(--accent-orb)"
  return "text-white/70"
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
      <div className={cn("min-w-0 rounded-2xl px-4 py-3", rankCardClass(user.rank))}>
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
    <article className={cn("relative min-w-0 overflow-hidden rounded-2xl px-4 py-3 text-center", rankCardClass(user.rank))}>
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
            className={cn("size-full rounded-full border-2", user.rank === 1 ? "border-(--accent-orb)/55" : "border-white/25")}
          />
          {isPrizePlace ? (
            <span
              className="absolute -top-1.5 -right-1.5 z-10 flex size-5 items-center justify-center rounded-full border border-(--accent-orb)/50 bg-(--accent-orb)/80 shadow-[0_0_10px_color-mix(in_srgb,var(--accent-orb)_45%,transparent)]"
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
    <div className="w-full">
      <div className="mb-2 flex items-center gap-2 px-1">
        <TrophyIcon className="size-4 text-(--accent-orb)" aria-hidden />
        <h3 className="text-[0.7rem] font-medium tracking-[0.18em] text-(--accent-orb)/85">рейтинг</h3>
      </div>
      <div
        className="grid gap-2"
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
