"use client"

import { lazy, Suspense, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Item } from "@/components/ui/item"
import Button from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import Skeleton from "@/components/ui/skeleton"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
const PrizeLottie = lazy(() => import("../lottie/PrizeLottie"))
import { UserAvatar, userProfileAdminSubtitle } from "@/components/common/UserAvatar"
import { ElementEffectsList } from "@/components/elements/ElementEffectsList"

import { cn } from "@/lib/utils"
import { formatQuizPoints, isNegativeQuizPoints, quizPointsToneClass } from "@/lib/quiz-points"
import { RANDOM_PRIZE_MIN_CORRECT_PERCENT } from "@/lib/report-prizes"
import {
  reportQuestionScoreBreakdown,
  reportQuestionScoreLabel,
  reportQuestionScoreVariant,
} from "@/lib/quiz-question-score"
import { useUserByTgId } from "@/queries/user"
import { useShowDataUser } from "@/hooks/use-show-data-user"
import { reportUserScore, reportUserTotalPoints, type IReportQuestionScore, type IReportUserPoints } from "@/api/reports"

interface IProps extends IReportUserPoints {
  tgId: number
  reducedEffects?: boolean
  reportId?: string | number
  isPrizePlace?: boolean
  isRandomPrize?: boolean
}

function rankBadgeClass(rank: number, reducedEffects: boolean) {
  if (rank === 1) {
    return "border-amber-400/55 bg-amber-500/35 text-amber-50"
  }
  if (rank === 2) {
    return "border-slate-300/50 bg-slate-400/30 text-slate-50"
  }
  if (rank === 3) {
    return "border-orange-400/50 bg-orange-500/30 text-orange-50"
  }
  return "border-white/15 bg-white/10 text-white/85"
}

function sortQuestions(list?: IReportQuestionScore[]) {
  return (list ?? []).toSorted((a, b) => a.index - b.index)
}

function QuestionScoreRow({ q, reducedEffects }: { q: IReportQuestionScore; reducedEffects: boolean }) {
  const variant = reportQuestionScoreVariant(q)
  const title = q.title?.trim()
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border px-3 py-2 text-sm",
        variant === "muted" && "border-border/80 bg-muted/40 text-muted-foreground",
        variant === "ok" &&
          cn("border-emerald-500/45 text-emerald-950 dark:text-emerald-50", reducedEffects ? "bg-emerald-500/20" : "bg-emerald-500/25"),
        variant === "bad" && cn("border-rose-500/45 text-rose-950 dark:text-rose-50", reducedEffects ? "bg-rose-500/20" : "bg-rose-500/25"),
      )}
    >
      <div className="flex flex-row items-center justify-between gap-3">
        <span className="min-w-0 flex-1 overflow-hidden">
          {title ? (
            <span className="block truncate text-xs font-normal opacity-80" title={title}>
              {title}
            </span>
          ) : (
            <span className="text-xs font-medium opacity-80">Вопрос {q.index + 1}</span>
          )}
        </span>
        <span className={cn("shrink-0 font-mono text-xs font-semibold whitespace-nowrap tabular-nums", q.points != null && isNegativeQuizPoints(q.points) && "text-rose-600 dark:text-rose-300")}>
          <span className="inline-grid grid-cols-[minmax(0,1fr)_0.75rem] items-center gap-1">
            <span>{reportQuestionScoreLabel(q)}</span>
            {q.points != null ? <PickaxeIcon points={q.points} className="size-3 shrink-0" /> : null}
          </span>
        </span>
      </div>
      <ElementEffectsList effects={q.element_effects} variant="strip" className="border-border/60 border-t pt-1.5" />
    </div>
  )
}

function ItemUserReportPoints({
  telegram_id,
  points,
  total_points,
  rank,
  tgId,
  reducedEffects = false,
  reportId,
  isPrizePlace = false,
  isRandomPrize = false,
}: IProps) {
  const showDataUsers = useShowDataUser()
  const score = reportUserTotalPoints({ points, total_points })
  const [scoreOpen, setScoreOpen] = useState(false)
  const { data, isLoading } = useUserByTgId(telegram_id, { enabled: !!telegram_id && !!tgId })

  const {
    data: userScoreDetail,
    isLoading: isLoadingUserScore,
    isError: isUserScoreError,
    error: userScoreError,
  } = useQuery({
    queryKey: ["report-user-score", reportId, telegram_id],
    queryFn: () => reportUserScore(reportId!, telegram_id),
    enabled: !!reportId && !!telegram_id && !!tgId && scoreOpen,
  })

  const detailQuestions = sortQuestions(userScoreDetail?.questions)
  const breakdown = reportQuestionScoreBreakdown(userScoreDetail?.questions)

  const pseudo = data?.pseudo?.trim() || `Пользователь ${telegram_id}`
  const adminSubtitle = userProfileAdminSubtitle(data)
  const avatar = data?.avatar
  const bg = data?.bg

  if (isLoading) {
    return (
      <Item variant="outline" size="sm" role="listitem" className="justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-7 w-16 rounded-md" />
      </Item>
    )
  }

  const scorePanel = reportId ? (
    <div
      className={cn("border-border bg-card/40 overflow-hidden rounded-b-xl border border-t-0 px-3 py-3", !scoreOpen && "hidden")}
      id={`user-score-${String(telegram_id)}`}
      role="region"
      aria-label="Детализация очков"
    >
      {isLoadingUserScore ? (
        <div className="flex justify-center py-4">
          <Spinner className="text-muted-foreground size-6" />
        </div>
      ) : isUserScoreError ? (
        <p className="text-destructive text-center text-sm">
          {userScoreError instanceof Error ? userScoreError.message : "Не удалось загрузить"}
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:justify-start">
            <span className="tabular-nums">
              <span className="text-muted-foreground">Верно:</span>{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{breakdown.right}</span>
            </span>
            <span className="tabular-nums">
              <span className="text-muted-foreground">Неверно:</span>{" "}
              <span className="font-semibold text-rose-600 dark:text-rose-400">{breakdown.wrong}</span>
            </span>
            <span className="tabular-nums">
              <span className="text-muted-foreground">Пропуск / воздержались:</span>{" "}
              <span className="text-muted-foreground font-semibold">{breakdown.abstained}</span>
            </span>
          </div>
          {detailQuestions.length > 0 ? (
            <ul className="space-y-1.5" aria-label="По вопросам">
              {detailQuestions.map((q) => (
                <li key={`${q.question_id}-${q.index}`}>
                  <QuestionScoreRow q={q} reducedEffects={reducedEffects} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  ) : null

  return (
    <div
      className={cn(
        "relative space-y-0",
        isPrizePlace && "rounded-xl border-2 border-amber-400/70 bg-amber-500/8",
        isRandomPrize && !isPrizePlace && "rounded-xl border-2 border-emerald-400/45 bg-emerald-500/8",
      )}
    >
      {isPrizePlace ? (
        <div
          className="pointer-events-none absolute -top-2 -left-2 z-10 flex size-8 items-center justify-center rounded-full border-2 border-amber-300/80 bg-linear-to-br from-amber-400 to-amber-600"
          aria-hidden
        >
          <Suspense fallback={null}>
            <PrizeLottie className="size-full rounded-full" />
          </Suspense>
        </div>
      ) : isRandomPrize ? (
        <div
          className="pointer-events-none absolute -top-2 -left-2 z-10 flex size-8 items-center justify-center rounded-full border-2 border-emerald-300/70 bg-linear-to-br from-emerald-400 to-emerald-600"
          aria-hidden
        >
          <Suspense fallback={null}>
            <PrizeLottie className="size-full rounded-full" />
          </Suspense>
        </div>
      ) : null}
      <Item
        variant="outline"
        size="sm"
        role="listitem"
        className={cn(
          "bg-card/60 flex flex-row flex-nowrap items-center justify-between gap-2",
          reportId && scoreOpen && "rounded-b-none border-b-0",
          isPrizePlace && "border-transparent bg-transparent",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          {rank != null ? (
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg border text-xs font-bold tabular-nums",
                isPrizePlace ? "border-amber-400/55 bg-amber-500/30 text-amber-50" : rankBadgeClass(rank, reducedEffects),
              )}
              aria-label={isPrizePlace ? `Призовое место ${rank}` : `Место ${rank}`}
            >
              {rank}
            </div>
          ) : null}
          <UserAvatar variant="report" avatar={avatar} bg={bg} pseudo={pseudo} photoUrl={data?.photo_url} reducedEffects={reducedEffects} />
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              <p className="text-foreground min-w-0 truncate text-sm font-semibold" title={pseudo}>
                {pseudo}
                {isRandomPrize ? (
                  <span
                    className="ml-2 inline-block rounded bg-emerald-600/10 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-700 dark:text-emerald-200"
                    title={`Розыгрыш среди игроков вне призовых мест с ${RANDOM_PRIZE_MIN_CORRECT_PERCENT}%+ верных ответов`}
                  >
                    случайный приз
                  </span>
                ) : null}
              </p>
            </div>
            {adminSubtitle && showDataUsers ? (
              <span className="text-muted-foreground block truncate text-xs font-normal" title={adminSubtitle}>
                ({adminSubtitle})
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 self-center">
          <div className="grid grid-cols-[minmax(0,1fr)_0.875rem] items-center gap-1.5">
            <span className={cn("text-foreground text-sm font-semibold whitespace-nowrap", quizPointsToneClass(score, "text-foreground", "text-rose-600 dark:text-rose-400"))}>
              {formatQuizPoints(score)}
            </span>
            <PickaxeIcon points={score} className="size-3.5" />
          </div>
          {reportId ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-expanded={scoreOpen}
              aria-controls={`user-score-${String(telegram_id)}`}
              aria-label={scoreOpen ? "Скрыть детализацию очков" : "Показать детализацию очков"}
              onClick={() => setScoreOpen((o) => !o)}
            >
              {scoreOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          ) : null}
        </div>
      </Item>
      {scorePanel}
    </div>
  )
}

ItemUserReportPoints.displayName = "ItemUserReportPoints"
export default ItemUserReportPoints
