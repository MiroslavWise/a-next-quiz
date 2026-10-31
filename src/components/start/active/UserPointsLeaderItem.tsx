"use client"

import { lazy, Suspense } from "react"
import { Check, Gift } from "lucide-react"

import Skeleton from "@/components/ui/skeleton"
import PickaxeIcon from "@/components/icons/PickaxeIcon"
import UserAnswerStatusBars from "./UserAnswerStatusBars"
const RatingScale = lazy(() => import("../webp/rating-scale"))
import { UserAvatar, userProfileAdminSubtitle } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import { useShowDataUser } from "@/hooks/use-show-data-user"
import type { IUsersAnswerStatusEntry } from "@/api/reports"
import { formatQuizPoints, isNegativeQuizPoints } from "@/lib/quiz-points"
import { normalizeTelegramId } from "@/lib/normalize"
import { TeamPairBadge } from "@/components/start/teams/TeamPairBadge"
import { pairAvatarRingStyle } from "@/components/start/teams/PairBezierOverlay"

interface IProps {
  tgId: number
  telegram_id: string | number
  points: number
  rank: number
  rank_delta?: number
  points_delta?: number
  isPrizePlace?: boolean
  answerOrder?: number
  isQuestionEnded?: boolean
  elementAvatarId?: number | null
  totalQuestions?: number
  activeIndex?: number
  answerEntriesByIndex?: Map<number, IUsersAnswerStatusEntry>
  pairColor?: string
  partnerTelegramId?: number
}

function UserPointsLeaderItem({
  tgId,
  telegram_id,
  points,
  rank,
  rank_delta,
  points_delta,
  isPrizePlace = false,
  answerOrder,
  isQuestionEnded,
  elementAvatarId,
  totalQuestions = 0,
  activeIndex,
  answerEntriesByIndex,
  pairColor,
  partnerTelegramId,
}: IProps) {
  const showDataUsers = useShowDataUser()
  const { data, isLoading } = useUserByTgId(telegram_id, { enabled: !!tgId && !!telegram_id })
  const showAnswerDots = totalQuestions > 0

  if (isLoading) {
    return (
      <li data-flip-id={String(telegram_id)} className="glass-start-slab flex flex-col gap-1 rounded-lg px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="ml-auto h-3 w-10 rounded-md" />
        </div>
        {showAnswerDots ? <Skeleton className="h-1.5 w-full rounded-full" /> : null}
      </li>
    )
  }

  const pseudo = data?.pseudo?.trim() || `Пользователь ${telegram_id}`
  const adminSubtitle = userProfileAdminSubtitle(data)
  const bg = data?.bg
  const isTopThreeAnswer = answerOrder != null && answerOrder <= 3
  const isGameAvatar = elementAvatarId != null && Number(telegram_id) === elementAvatarId
  const hasPointsDelta = points_delta != null && points_delta !== 0
  const isPositiveDelta = (points_delta ?? 0) > 0
  const anchorId = normalizeTelegramId(telegram_id)

  return (
    <li
      data-flip-id={String(telegram_id)}
      title={isGameAvatar ? "Аватар игры" : undefined}
      className={cn(
        "glass-start-slab relative flex flex-col gap-1 rounded-lg px-2 py-1.5",
        isPrizePlace && "border-2 border-black/80 shadow-[4px_4px_0_0_#0a0c0b]",
        isPrizePlace && "outline outline-2 outline-(--accent-orb)",
        isGameAvatar && !isPrizePlace && "border-2 border-white/80 shadow-[4px_4px_0_0_#e5e5e5]",
        isGameAvatar && isPrizePlace && "border-white/80",
      )}
    >
      <div
        className={cn(
          "relative flex flex-row items-center gap-1.5 transition-[filter] duration-500",
          !isQuestionEnded && cn(!!answerOrder && answerOrder > 0 ? "grayscale-0" : "grayscale"),
        )}
      >
        {answerOrder != null ? (
          <span
            className="absolute -top-0.5 -left-0.5 z-10 flex size-4 items-center justify-center rounded-md border-2 border-black/80 bg-[#121418] p-px shadow-[1px_1px_0_0_#0a0c0b]"
            aria-label={isTopThreeAnswer ? `Ответил ${answerOrder}-м по счёту` : "Ответил правильно"}
            title={isTopThreeAnswer ? `Порядок ответа: ${answerOrder}` : "Ответил правильно"}
          >
            {isTopThreeAnswer && answerOrder >= 1 ? (
              <span className="text-[0.6rem] leading-none font-bold text-white tabular-nums">{answerOrder}</span>
            ) : (
              <Check className="size-2.5 text-white" aria-hidden />
            )}
          </span>
        ) : null}
        {isPrizePlace ? (
          <span
            className="absolute -top-px -right-px z-10 flex size-3.25 items-center justify-center overflow-hidden rounded-sm border-2 border-black/80 bg-(--accent-orb) shadow-[1px_1px_0_0_#0a0c0b]"
            aria-label="Призовое место"
            title="Призовое место"
          >
            <Gift className="size-2.5 text-white" aria-hidden />
          </span>
        ) : null}
        <div
          className="relative inline-grid shrink-0 rounded-md"
          data-pair-anchor={pairColor && Number.isFinite(anchorId) ? anchorId : undefined}
          style={pairColor ? pairAvatarRingStyle(pairColor) : undefined}
        >
          <UserAvatar
            variant="leader"
            avatar={data?.avatar}
            bg={bg}
            pseudo={pseudo}
            photoUrl={data?.photo_url}
            element={data?.element}
            isGameAvatar={isGameAvatar}
            photoOverlay="never"
            className="size-7 text-[0.65rem]"
            partnerTelegramId={partnerTelegramId}
            partnerColor={pairColor}
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-0.5">
          <p
            className="truncate text-[0.7rem] leading-none font-medium text-white"
            style={pairColor ? { color: pairColor } : undefined}
          >
            {pseudo}
          </p>
          {pairColor ? <TeamPairBadge color={pairColor} /> : null}
          {showDataUsers && adminSubtitle && <span className="truncate text-[0.45rem] leading-none text-white/60">{adminSubtitle}</span>}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {rank_delta != null && rank_delta !== 0 && (
            <Suspense fallback={null}>
              <span
                className={cn(
                  "inline-flex flex-nowrap items-center gap-px text-[0.625rem] leading-none font-semibold tabular-nums",
                  rank_delta > 0 ? "text-emerald-200" : "text-rose-200",
                )}
                aria-label="Изменение места"
                title="Изменение места"
              >
                <RatingScale isUp={rank_delta > 0} className={cn("size-3.5", rank_delta > 0 && "rotate-180")} />
                {rank_delta}
              </span>
            </Suspense>
          )}
          <div
            className={cn(
              "relative grid shrink-0 grid-cols-[minmax(0,1fr)_0.65rem] items-center gap-0.75 rounded-sm border px-1 py-0.75 text-[0.65rem] leading-none font-semibold",
              isPrizePlace ? "border-black/80 bg-[#121418] text-(--accent-orb)" : "border-black/80 bg-[#121418] text-white",
              isNegativeQuizPoints(points) && !isPrizePlace && "border-black/80 text-unfaithful",
            )}
          >
            {hasPointsDelta && (
              <span
                className={cn(
                  "absolute -top-2 -right-1 z-10 inline-flex items-center rounded-md border-2 border-black/80 px-1 py-px text-[0.5rem] leading-none font-bold tabular-nums shadow-[1px_1px_0_0_#0a0c0b]",
                  isPositiveDelta
                    ? "bg-(--faithful) text-white"
                    : "bg-(--unfaithful) text-white",
                )}
                aria-label={`За раунд: ${isPositiveDelta ? "+" : ""}${points_delta}`}
                title={`За раунд: ${isPositiveDelta ? "+" : ""}${points_delta}`}
              >
                {isPositiveDelta ? "+" : ""}
                {formatQuizPoints(points_delta as number)}
              </span>
            )}
            <span className="whitespace-nowrap">{formatQuizPoints(points)}</span>
            <PickaxeIcon points={points} className="size-2.5" />
          </div>
        </div>
      </div>
      {showAnswerDots && (
        <UserAnswerStatusBars
          totalQuestions={totalQuestions}
          entriesByIndex={answerEntriesByIndex}
          activeIndex={activeIndex}
          isQuestionEnded={isQuestionEnded}
        />
      )}
    </li>
  )
}

UserPointsLeaderItem.displayName = "UserPointsLeaderItem"
export default UserPointsLeaderItem
