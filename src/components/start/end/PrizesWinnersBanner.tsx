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
  if (winner.place === 1) return "text-(--accent-orb)"
  return "text-white/70"
}

function placeRowClass(winner: IPrizesUsers) {
  if (winner.place === 1) return "glass-start-slab glass-start-slab-selected"
  if (isRandomPrizeEntry(winner)) return "glass-start-slab glass-start-slab-faithful"
  return "glass-start-slab"
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
        "flex items-center gap-3 rounded-2xl px-3 py-2.5",
        placeRowClass(winner),
        itsMe && "glass-start-slab-selected",
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
          className={cn(itsMe ? "ring-2 ring-(--accent-orb)/40" : undefined)}
        />
        <span
          className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border border-(--accent-orb)/50 bg-(--accent-orb)/80 shadow-[0_0_10px_color-mix(in_srgb,var(--accent-orb)_45%,transparent)]"
          aria-hidden
        >
          <PrizeLottie className="size-4" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white/92" title={pseudo}>
          {pseudo}
          {itsMe ? <span className="ml-1.5 text-[0.65rem] font-medium text-(--accent-orb)">(вы)</span> : null}
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
        <PickaxeIcon points={winner.points} className="size-3.5 text-(--accent-orb)" />
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
        className="glass-start-liquid-palette mb-0 w-full rounded-2xl p-3 sm:p-4"
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
    <section className="glass-start-liquid-palette w-full rounded-2xl p-3 sm:p-4" aria-label="Призёры">
      <header className="mb-3 flex items-center gap-2">
        <TrophyIcon className="size-4 text-(--accent-orb)" aria-hidden />
        <h3 className="text-[0.7rem] font-medium tracking-[0.18em] text-(--accent-orb)/85">{sectionTitle}</h3>
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
