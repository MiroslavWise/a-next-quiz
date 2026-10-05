"use client"

import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"

import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import { UserAvatar } from "@/components/common/UserAvatar"
import { useReportTeams } from "@/components/start/teams/use-report-teams"

import { getRank } from "@/api/rank"
import type { IElementEffect } from "@/interface/element-effect"
import type { LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"
import { pairColor, partnerTelegramId, teamOfMember } from "@/lib/report-teams"
import { formatQuizPoints, isNegativeQuizPoints } from "@/lib/quiz-points"
import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"

/** Как часто во время игры переспрашивать сумму очков пары. */
const PAIR_POINTS_POLL_MS = 15_000

function sumEffects(effects?: IElementEffect[]) {
  if (!effects?.length) return null
  return effects.reduce((sum, effect) => sum + (Number(effect.points) || 0), 0)
}

function formatSignedPoints(points: number) {
  if (points > 0) return `+${formatQuizPoints(points)}`
  return formatQuizPoints(points)
}

export function PairMateBanner({
  name,
  color,
  streak,
  total,
  last,
  avatar,
  bg,
  photoUrl,
  element,
}: {
  name: string
  color: string
  streak: number
  total: number
  last: number | null
  avatar?: string | null
  bg?: string | null
  photoUrl?: string | null
  element?: Parameters<typeof UserAvatar>[0]["element"]
}) {
  const tone = isNegativeQuizPoints(total) ? "text-rose-200" : total > 0 ? "text-emerald-200" : "text-white/80"
  return (
    <section
      aria-label={`Пара с ${name}`}
      className="glass-start-liquid-palette flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5"
      style={{ borderColor: color, boxShadow: `0 0 18px color-mix(in srgb, ${color} 35%, transparent)` }}
    >
      <UserAvatar
        variant="waiting"
        avatar={avatar}
        bg={bg}
        pseudo={name}
        photoUrl={photoUrl}
        element={element}
        photoOverlay="never"
        className="size-11 text-xs"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-white/50 uppercase">Ваша пара</p>
        <p className="truncate text-sm font-semibold" style={{ color }}>
          {name}
        </p>
        {streak > 0 ? <p className="mt-0.5 text-[0.65rem] text-white/60">Серия пары {streak}</p> : null}
        {last != null && last !== 0 ? <p className="text-[0.65rem] text-white/55">За вопрос {formatSignedPoints(last)}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-[0.6rem] font-medium tracking-wide text-white/45 uppercase">вместе</span>
        <span className={cn("inline-flex items-center gap-1 text-base font-bold tabular-nums", tone)} aria-label={`Очки пары ${formatSignedPoints(total)}`}>
          {formatSignedPoints(total)}
          <PickaxeIcon points={total} className="size-3.5" />
        </span>
      </div>
    </section>
  )
}

export function PairMateCard({
  reportId,
  tgId,
  lastByType,
  activeIndex,
  isQuestionEnded,
}: {
  reportId: string
  tgId: number
  lastByType: LastSocketEventByType<QuizEvent>
  activeIndex: number
  isQuestionEnded: boolean
}) {
  const { data: teamsState } = useReportTeams({ reportId, lastByType })
  const team = teamOfMember(teamsState?.teams, tgId)
  const partnerId = partnerTelegramId(team, tgId)
  const { data, refetch } = useQuery({
    queryKey: ["rank", reportId, tgId, "pair"],
    queryFn: () => getRank(reportId),
    enabled: !!reportId && !!tgId && partnerId != null,
    refetchInterval: partnerId != null ? PAIR_POINTS_POLL_MS : false,
    refetchIntervalInBackground: false,
  })

  useEffect(() => {
    if (partnerId == null || !isQuestionEnded) return
    const timer = window.setTimeout(() => void refetch(), 1_500)
    return () => window.clearTimeout(timer)
  }, [partnerId, isQuestionEnded, activeIndex, refetch])

  const { data: partner } = useUserByTgId(partnerId ?? 0, { enabled: partnerId != null && !!tgId })
  if (partnerId == null || !team) return null

  const color = pairColor(team.id)
  const name = partner?.pseudo?.trim() || `Участник ${partnerId}`
  const total = Number(data?.pair_points ?? 0)
  const last = sumEffects(data?.team_effects)
  const streak = team.pair_streak ?? 0

  return (
    <PairMateBanner
      name={name}
      color={color}
      streak={streak}
      total={total}
      last={last}
      avatar={partner?.avatar}
      bg={partner?.bg}
      photoUrl={partner?.photo_url}
      element={partner?.element}
    />
  )
}
