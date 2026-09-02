import { MedalIcon, TrophyIcon } from "lucide-react"

import Skeleton from "@/components/ui/skeleton"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import PrizeLottie from "@/components/lottie/PrizeLottie"
import { UserAvatar, userProfileAdminSubtitle } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { isRandomPrizeEntry, sortPrizeWinners } from "@/lib/report-prizes"
import { useUserByTgId } from "@/queries/user"
import type { IPrizesUsers } from "@/api/reports"
import { useReportPrizesUsers } from "../hooks/use-report-prizes-users"

interface IProps {
  reportId: string | number
  tgId: number
  elementAvatarId?: number | null
}

function placeLabel(winner: IPrizesUsers) {
  return `${winner.place} место`
}

function placeAccentClass(winner: IPrizesUsers) {
  if (winner.place === 1) return "text-amber-300"
  if (winner.place === 2) return "text-slate-200"
  if (winner.place === 3) return "text-orange-300"
  return "text-amber-200/90"
}

function placeRowClass(winner: IPrizesUsers) {
  if (winner.place === 1) return "border-amber-400/45 bg-amber-500/12"
  if (winner.place === 2) return "border-slate-300/35 bg-white/6"
  if (winner.place === 3) return "border-orange-400/35 bg-orange-500/10"
  if (isRandomPrizeEntry(winner)) return "border-emerald-300/25 bg-emerald-700/6"
  return "border-amber-300/25 bg-white/5"
}

function PrizeWinnerRow({
  winner,
  tgId,
  elementAvatarId,
}: {
  winner: IPrizesUsers
  tgId: number
  elementAvatarId?: number | null
}) {
  const { data, isLoading } = useUserByTgId(winner.telegram_id, { enabled: !!winner.telegram_id && !!tgId })

  if (isLoading) {
    return <Skeleton className="h-14 w-full rounded-xl bg-white/8" />
  }

  const pseudo = data?.pseudo?.trim() || `Пользователь ${winner.telegram_id}`
  const telegramLabel = userProfileAdminSubtitle(data)
  const itsMe = tgId === winner.telegram_id
  const isGameAvatar = elementAvatarId != null && Number(winner.telegram_id) === elementAvatarId
  const PlaceIcon = winner.place === 1 ? TrophyIcon : MedalIcon

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5",
        placeRowClass(winner),
        itsMe && "ring-1 ring-rose-400/35",
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar
          variant="report"
          avatar={data?.avatar}
          bg={data?.bg}
          pseudo={pseudo}
          photoUrl={data?.photo_url}
          element={data?.element}
          isGameAvatar={isGameAvatar}
          photoOverlay="always"
          className={cn(itsMe ? "ring-2 ring-rose-400/35" : undefined)}
        />
        <span
          className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border border-amber-200/70 bg-linear-to-br from-amber-300 to-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.45)]"
          aria-hidden
        >
          <PrizeLottie className="size-4" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white/92" title={pseudo}>
          {pseudo}
          {itsMe ? <span className="ml-1.5 text-[0.65rem] font-medium text-rose-200/85">(вы)</span> : null}
        </p>
        {telegramLabel ? (
          <p className="truncate text-xs text-white/55" title={telegramLabel}>
            ({telegramLabel})
          </p>
        ) : null}
        {isRandomPrizeEntry(winner) ? null : (
          <p className={cn("mt-0.5 inline-flex items-center gap-1 text-xs font-bold tracking-wide", placeAccentClass(winner))}>
            <PlaceIcon className="size-3.5" aria-hidden />
            {placeLabel(winner)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-white/90 tabular-nums">
        <PickaxeIcon points={winner.points} className="size-3.5 text-amber-200/80" />
        {winner.points.toLocaleString("ru-RU")}
      </div>
    </li>
  )
}

function PrizesWinnersBanner({ reportId, tgId, elementAvatarId }: IProps) {
  const { data: winners, isLoading } = useReportPrizesUsers({ reportId })

  if (isLoading) {
    return (
      <section
        className="mb-4 w-full rounded-xl border border-amber-400/35 bg-linear-to-b from-amber-500/12 via-amber-950/10 to-transparent p-3 sm:p-4"
        aria-busy="true"
        aria-label="Призёры"
      >
        <Skeleton className="mb-3 h-4 w-28 rounded-md bg-white/10" />
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-xl bg-white/8" />
          <Skeleton className="h-14 w-full rounded-xl bg-white/8" />
        </div>
      </section>
    )
  }

  if (!winners?.length) return null

  const sortedWinners = sortPrizeWinners(winners)
  const hasRankedPrizes = sortedWinners.some((winner) => winner.place > 0)
  const sectionTitle = hasRankedPrizes ? "Призовые места" : "Случайный приз"

  return (
    <section
      className="mb-4 w-full rounded-xl border border-amber-400/45 bg-linear-to-b from-amber-500/14 via-amber-950/12 to-black/10 p-3 shadow-[0_0_24px_rgba(251,191,36,0.08)] sm:p-4"
      aria-label="Призёры"
    >
      <header className="mb-3 flex items-center gap-2">
        <TrophyIcon className="size-4 text-amber-300" aria-hidden />
        <h3 className="text-sm font-bold tracking-[0.18em] text-amber-100 uppercase">{sectionTitle}</h3>
      </header>
      <ul className="space-y-2">
        {sortedWinners.map((winner) => (
          <PrizeWinnerRow key={winner.telegram_id} winner={winner} tgId={tgId} elementAvatarId={elementAvatarId} />
        ))}
      </ul>
    </section>
  )
}

PrizesWinnersBanner.displayName = "PrizesWinnersBanner"
export default PrizesWinnersBanner
