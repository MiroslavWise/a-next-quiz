"use client"

import { lazy, Suspense } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

import Skeleton from "@/components/ui/skeleton"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import PrizeLottie from "@/components/lottie/PrizeLottie"
import UserAnswerStatusDots from "./UserAnswerStatusDots"
const RatingScale = lazy(() => import("../webp/rating-scale"))
import { UserAvatar, userProfileAdminSubtitle } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import { useShowDataUser } from "@/hooks/use-show-data-user"
import type { TUsersAnswerStatusFromApi } from "@/api/reports"
import { formatQuizPoints, isNegativeQuizPoints } from "@/lib/quiz-points"

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
  answerStatusByIndex?: Map<number, TUsersAnswerStatusFromApi>
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
  answerStatusByIndex,
}: IProps) {
  const showDataUsers = useShowDataUser()
  const { data, isLoading } = useUserByTgId(telegram_id, { enabled: !!tgId && !!telegram_id })
  const showAnswerDots = totalQuestions > 0

  if (isLoading) {
    return (
      <li data-flip-id={String(telegram_id)} className="glass-start-slab flex flex-col gap-1 rounded-xl px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-7 rounded-full" />
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

  return (
    <li
      data-flip-id={String(telegram_id)}
      title={isGameAvatar ? "Аватар игры" : undefined}
      className={cn(
        "glass-start-slab relative flex flex-col gap-1 rounded-xl px-2 py-1.5",
        isPrizePlace && "border-amber-400/40 bg-amber-500/12 ring-1 ring-amber-400/25",
        isGameAvatar && "shadow-[0_0_16px_rgba(255,255,255,0.42),0_0_1px_rgba(255,255,255,0.95)]",
        isGameAvatar && !isPrizePlace && "border border-white/50 bg-white/12 ring-1 ring-white/40",
        isGameAvatar && isPrizePlace && "ring-white/55",
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
            className="absolute -top-0.5 -left-0.5 z-10 flex size-4 items-center justify-center rounded-md border border-white/10 bg-black/45 p-px"
            aria-label={isTopThreeAnswer ? `Ответил ${answerOrder}-м по счёту` : "Ответил правильно"}
            title={isTopThreeAnswer ? `Порядок ответа: ${answerOrder}` : "Ответил правильно"}
          >
            <DotLottieReact
              src={isTopThreeAnswer ? `/lottie/answers/${answerOrder}.lottie` : "/lottie/answers/check.lottie"}
              autoplay
              loop
              speed={0.6}
              backgroundColor="transparent"
              className="size-full"
            />
          </span>
        ) : null}
        {isPrizePlace ? (
          <span
            className="absolute -top-px -right-px z-10 flex size-3.25 items-center justify-center overflow-hidden rounded-full border border-amber-200/70 bg-linear-to-br from-amber-400 to-amber-600"
            aria-label="Призовое место"
            title="Призовое место"
          >
            <PrizeLottie className="size-2.5" />
          </span>
        ) : null}
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
        />
        <div className="flex min-w-0 flex-col justify-center gap-0.5">
          <p className="truncate text-[0.7rem] leading-none font-medium text-white">{pseudo}</p>
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
              isPrizePlace ? "border-amber-300/35 bg-amber-500/20 text-amber-50" : "border-white/15 bg-white/10 text-white",
              isNegativeQuizPoints(points) && !isPrizePlace && "border-rose-400/35 bg-rose-500/15 text-rose-100",
            )}
          >
            {hasPointsDelta && (
              <span
                className={cn(
                  "absolute -top-2 -right-1 z-10 inline-flex items-center rounded-full border px-1 py-px text-[0.5rem] leading-none font-bold tabular-nums shadow-sm shadow-black/40",
                  isPositiveDelta
                    ? "border-emerald-300/50 bg-emerald-500/85 text-emerald-50"
                    : "border-rose-300/50 bg-rose-500/85 text-rose-50",
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
        <UserAnswerStatusDots
          totalQuestions={totalQuestions}
          statusByIndex={answerStatusByIndex}
          activeIndex={activeIndex}
          isQuestionEnded={isQuestionEnded}
        />
      )}
    </li>
  )
}

UserPointsLeaderItem.displayName = "UserPointsLeaderItem"
export default UserPointsLeaderItem
