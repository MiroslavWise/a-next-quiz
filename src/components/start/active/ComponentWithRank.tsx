"use client"

import { useQuery } from "@tanstack/react-query"
import { Crown, Sparkles } from "lucide-react"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"

import CountText from "@/components/common/count-text"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import { ElementEffectsList } from "@/components/elements/ElementEffectsList"

import { cn } from "@/lib/utils"
import { getRank } from "@/api/rank"
import { useRankBonuses } from "../hooks/use-rank-bonuses"
import { useElementEffectsRank } from "../hooks/use-element-effects-rank"
import { useSkillEffectsRank } from "../hooks/use-skill-effects-rank"
import { LUCKY_BONUS_PERCENT } from "@/lib/game-streak-tiers"
import { formatQuizPoints, isNegativeQuizPoints, quizPointsToneClass } from "@/lib/quiz-points"

export interface IComponentWithRankProps {
  reportId: string
  tgId: number
  activeIndex: number
}

function getRankMessage() {
  const messages = [
    "Вы в топ-3. Отличный темп.",
    "Стабильно в тройке. Очень сильная игра.",
    "Вы среди лучших. Держите этот ритм.",
    "Призовая зона за вами. Идете уверенно.",
    "Вы в тройке лидеров. Так держать!",
    "Вы в числе фаворитов. Отличная динамика.",
    "Лидерская форма. Продолжайте в том же духе.",
    "Вы в топе. Каждое решение работает на результат.",
    "Сильная позиция — вы среди лучших игроков.",
    "Точно и уверенно. Топ-3 абсолютно по делу.",
    "Верх таблицы рядом. Темп выбран правильно.",
    "Вы задаете высокую планку игры.",
    "Тройка лидеров под контролем. Продолжайте.",
    "Чемпионский курс. Главное — не сбавлять.",
    "Отличная концентрация. Топ-3 удерживается уверенно.",
    "Вы в числе претендентов на победу.",
    "Мощный отрезок. Сохраняйте этот настрой.",
    "Хороший фокус и стабильность. Вы в топе.",
    "Позиция крепкая. Осталось закрепить преимущество.",
    "Сильная серия ответов. Вы среди лидеров.",
    "Идете очень ровно. Это уровень топ-3.",
    "Вы в лучшей группе игроков. Так держать.",
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}

const rankOutcomeChipClass =
  "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.6rem] font-semibold leading-none"

const rankOutcomeBlockClass = "mb-3 rounded-xl border px-3.5 py-2.5"

const STREAK_RING_RADIUS = 28
const STREAK_RING_CIRCUMFERENCE = 2 * Math.PI * STREAK_RING_RADIUS

function LuckyBonusPointsChip({ points }: { points: number }) {
  return (
    <span className={cn(rankOutcomeChipClass, "border-amber-300/45 bg-amber-500/20 font-bold text-amber-50 tabular-nums")}>
      <Sparkles className="size-2.5 shrink-0 text-amber-200 opacity-90" aria-hidden />
      +{points}
      <PickaxeIcon className="size-2.5 shrink-0" />
    </span>
  )
}

function StreakRing({ streak }: { streak: number }) {
  const broken = streak <= 0
  const progress = broken ? 0.42 : Math.min(1, streak / 8)
  const dashOffset = STREAK_RING_CIRCUMFERENCE * (1 - progress)

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="relative grid size-16 place-items-center">
        <svg viewBox="0 0 72 72" className="absolute inset-0 size-full -rotate-90" aria-hidden>
          <circle cx="36" cy="36" r={STREAK_RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
          <circle
            cx="36"
            cy="36"
            r={STREAK_RING_RADIUS}
            fill="none"
            stroke={broken ? "var(--unfaithful)" : "var(--accent-orb)"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={broken ? "8 10" : STREAK_RING_CIRCUMFERENCE}
            strokeDashoffset={broken ? 0 : dashOffset}
            style={{
              filter: broken
                ? "drop-shadow(0 0 5px color-mix(in srgb, var(--unfaithful) 70%, transparent))"
                : "drop-shadow(0 0 6px color-mix(in srgb, var(--accent-orb) 70%, transparent))",
            }}
          />
        </svg>
        <span
          className={cn(
            "relative z-10 font-mono text-sm font-bold tabular-nums",
            broken ? "text-unfaithful" : "text-(--accent-orb)",
          )}
        >
          {streak}
        </span>
      </div>
      <p className={cn("text-center text-[0.62rem] font-medium", broken ? "text-unfaithful/90" : "text-white/55")}>
        {broken ? "Серия прервана" : `Серия ${streak}`}
      </p>
    </div>
  )
}

function ComponentWithRank({ reportId, tgId, activeIndex }: IComponentWithRankProps) {
  const { data, isFetching } = useQuery({
    queryKey: ["rank", reportId, tgId, activeIndex],
    queryFn: () => getRank(reportId),
    enabled: !!reportId && !!tgId,
    refetchOnMount: true,
  })

  const rank = data?.rank ?? null
  const prevRankRef = useRef<number | null>(null)
  const [rankFrom, setRankFrom] = useState<number | null>(null)

  useEffect(() => {
    if (typeof rank !== "number") return
    if (prevRankRef.current === null) {
      prevRankRef.current = rank
      return
    }
    if (prevRankRef.current !== rank) {
      setRankFrom(prevRankRef.current)
      prevRankRef.current = rank
    }
  }, [rank])

  const isTopThree = typeof rank === "number" && rank > 0 && rank <= 3
  const topMessage = useMemo(() => getRankMessage(), [reportId, tgId, rank])
  const rankDelta = typeof rank === "number" && rankFrom != null ? rankFrom - rank : 0

  const streak = Math.max(0, Number(data?.streak ?? 0) || 0)
  const { luckyBonus } = useRankBonuses({ activeIndex, data, isTopThree })
  const endElementEffects = useElementEffectsRank({ activeIndex, data })
  const endSkillEffects = useSkillEffectsRank({ activeIndex, data })

  if (isFetching && !data) {
    return <div className="glass-start-liquid-palette h-24 w-full animate-pulse rounded-2xl xl:h-28" />
  }

  if (!data) return null

  const totalPoints = Number(data.total_points ?? 0)
  const hasNegativeTotal = !isTopThree && isNegativeQuizPoints(totalPoints)

  return (
    <section className="glass-start-liquid-palette relative w-full rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 xl:px-7 xl:py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          {isTopThree ? (
            <>
              <p className="flex items-center gap-2 text-lg font-bold tracking-tight text-(--accent-orb)">
                <Crown className="size-5 shrink-0" aria-hidden />
                Вы в топе
              </p>
              <p className="text-sm leading-snug text-white/75">{topMessage}</p>
            </>
          ) : (
            <>
              {rankDelta !== 0 && typeof rank === "number" && rankFrom != null ? (
                <p
                  className={cn(
                    "text-lg font-bold tracking-tight",
                    rankDelta > 0 ? "text-faithful" : "text-[#FF8A4C]",
                  )}
                >
                  {rankDelta > 0 ? `+${rankDelta}` : rankDelta} место
                </p>
              ) : (
                <p className="text-lg font-bold tracking-tight text-white">{rank ? `#${rank}` : "—"}</p>
              )}
              {rankFrom != null && typeof rank === "number" && rankFrom !== rank ? (
                <p className="text-sm font-semibold text-white/80 tabular-nums">
                  {rankFrom} → {rank}
                </p>
              ) : null}
              <p className="flex items-center gap-1.5 text-xs text-white/70">
                до предыдущего
                <span className="inline-flex items-center gap-1 font-semibold text-(--accent-orb)">
                  <Suspense fallback={<span>0</span>}>
                    <CountText count={Math.max(0, data.points_to_prev)} />
                  </Suspense>
                  <PickaxeIcon tone="neutral" className="size-3.5" />
                </span>
              </p>
            </>
          )}
        </div>
        <StreakRing streak={streak} />
      </div>

      {hasNegativeTotal ? (
        <div className="mt-3 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3.5 py-2.5" role="status" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-white/50 uppercase xl:text-xs">Сумма очков</span>
            <span className={cn("inline-flex items-center gap-1 text-sm font-bold tabular-nums xl:text-base", quizPointsToneClass(totalPoints))}>
              {formatQuizPoints(totalPoints)}
              <PickaxeIcon points={totalPoints} className="size-3.5 shrink-0" />
            </span>
          </div>
          <p className="mt-1.5 text-[0.65rem] leading-snug text-rose-200/90 xl:text-xs">
            Сумма ниже нуля — учтены штрафы стихий за ошибки и пропуски.
          </p>
        </div>
      ) : null}

      {luckyBonus ? (
        <div
          className={cn(
            rankOutcomeBlockClass,
            "mt-3 overflow-hidden border-amber-300/45 bg-linear-to-r from-amber-500/20 via-yellow-500/10 to-amber-400/15 text-white/95 shadow-[0_0_28px_rgba(251,191,36,0.12)]",
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm leading-snug font-bold text-amber-50 xl:text-base">Повезло!</p>
              <p className="mt-0.5 text-xs leading-snug text-white/90 xl:text-sm">
                Случайный бонус <span className="font-semibold text-amber-200">+{LUCKY_BONUS_PERCENT}%</span> к очкам вопроса
              </p>
            </div>
            <LuckyBonusPointsChip points={luckyBonus.points} />
          </div>
        </div>
      ) : null}

      {endElementEffects?.length ? (
        <div className={cn(rankOutcomeBlockClass, "mt-3 overflow-hidden border-white/12 bg-black/25")} role="status" aria-live="polite">
          <ElementEffectsList effects={endElementEffects} variant="strip" />
        </div>
      ) : null}

      {endSkillEffects?.length ? (
        <div
          className={cn(rankOutcomeBlockClass, "mt-3 overflow-hidden border-(--accent-orb)/25 bg-(--accent-orb)/8")}
          role="status"
          aria-live="polite"
        >
          <p className="mb-1.5 text-[0.6rem] font-semibold tracking-[0.14em] text-white/50 uppercase">Способности</p>
          <ElementEffectsList effects={endSkillEffects} variant="strip" />
        </div>
      ) : null}
    </section>
  )
}

ComponentWithRank.displayName = "ComponentWithRank"
export default ComponentWithRank
