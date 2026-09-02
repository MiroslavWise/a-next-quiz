"use client"

import { useQuery } from "@tanstack/react-query";
import { Crown, Sparkles, Trophy } from "lucide-react";
import { Suspense, useMemo } from "react";

import CountText from "@/components/common/count-text";
import PickaxeIcon from "@/components/lottie/PickaxeIcon";
import { ElementEffectsList } from "@/components/elements/ElementEffectsList";

import { cn } from "@/lib/utils";
import { getRank } from "@/api/rank";
import { useRankBonuses } from "../hooks/use-rank-bonuses";
import { useElementEffectsRank } from "../hooks/use-element-effects-rank";
import { useSkillEffectsRank } from "../hooks/use-skill-effects-rank";
import { getStreakTier, LUCKY_BONUS_PERCENT } from "@/lib/game-streak-tiers";
import {
  formatQuizPoints,
  isNegativeQuizPoints,
  quizPointsToneClass,
} from "@/lib/quiz-points";

export interface IComponentWithRankProps {
  reportId: string;
  tgId: number;
  activeIndex: number;
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
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/** Общий размер чипов итога вопроса (lucky). */
const rankOutcomeChipClass =
  "inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[0.6rem] font-semibold leading-none";

const rankOutcomeBlockClass = "mb-3 rounded-xl border px-3.5 py-2.5";

function LuckyBonusPointsChip({ points }: { points: number }) {
  return (
    <span
      className={cn(
        rankOutcomeChipClass,
        "border-amber-300/45 bg-amber-500/20 font-bold text-amber-50 tabular-nums",
      )}
    >
      <Sparkles
        className="size-2.5 shrink-0 text-amber-200 opacity-90"
        aria-hidden
      />
      +{points}
      <PickaxeIcon className="size-2.5 shrink-0" />
    </span>
  );
}

function ComponentWithRank({
  reportId,
  tgId,
  activeIndex,
}: IComponentWithRankProps) {
  const { data, isFetching } = useQuery({
    queryKey: ["rank", reportId, tgId, activeIndex],
    queryFn: () => getRank(reportId),
    enabled: !!reportId && !!tgId,
    refetchOnMount: true,
  });

  const rank = data?.rank ?? null;
  const isTopThree = typeof rank === "number" && rank > 0 && rank <= 3;
  const topMessage = useMemo(() => getRankMessage(), [reportId, tgId, rank]);

  const streak = Math.max(0, Number(data?.streak ?? 0) || 0);
  const { luckyBonus } = useRankBonuses({ activeIndex, data, isTopThree });
  const endElementEffects = useElementEffectsRank({ activeIndex, data });
  const endSkillEffects = useSkillEffectsRank({ activeIndex, data });

  const tier = getStreakTier(streak);

  if (isFetching && !data) {
    return (
      <div className="glass-start-liquid-palette h-24 w-full animate-pulse rounded-xl border border-(--accent-orb)/35 xl:h-28 xl:rounded-2xl" />
    );
  }

  if (!data) return null;

  const totalPoints = Number(data.total_points ?? 0);
  const hasNegativeTotal = isNegativeQuizPoints(totalPoints);

  return (
    <section className="glass-start-liquid-palette relative w-full rounded-xl border border-(--accent-orb)/40 px-4 py-3.5 sm:px-5 sm:py-4 xl:rounded-2xl xl:px-7 xl:py-5">
      <div className="mb-2 flex items-center justify-between gap-3 xl:mb-3">
        <span className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase xl:text-sm">
          Ваш рейтинг
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {!isTopThree ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs leading-none font-semibold text-white/90 xl:gap-2 xl:px-3 xl:py-1.5 xl:text-sm">
              <Trophy className="size-3.5 xl:size-4" />
              {`#${data.rank}`}
            </span>
          ) : null}
        </div>
      </div>
      {hasNegativeTotal ? (
        <div
          className="mb-3 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3.5 py-2.5"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="text-[0.65rem] font-semibold tracking-[0.12em] text-white/50 uppercase xl:text-xs">
              Сумма очков
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-bold tabular-nums xl:text-base",
                quizPointsToneClass(totalPoints),
              )}
            >
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
              "overflow-hidden border-amber-300/45 bg-linear-to-r from-amber-500/20 via-yellow-500/10 to-amber-400/15 text-white/95 shadow-[0_0_28px_rgba(251,191,36,0.12)]",
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm leading-snug font-bold text-amber-50 xl:text-base">
                  Повезло!
                </p>
                <p className="mt-0.5 text-xs leading-snug text-white/90 xl:text-sm">
                  Случайный бонус{" "}
                  <span className="font-semibold text-amber-200">
                    +{LUCKY_BONUS_PERCENT}%
                  </span>{" "}
                  к очкам вопроса
                </p>
              </div>
              <LuckyBonusPointsChip points={luckyBonus.points} />
            </div>
          </div>
        ) : null}
      {endElementEffects?.length ? (
        <div
          className={cn(
            rankOutcomeBlockClass,
            "overflow-hidden border-white/12 bg-black/25",
          )}
          role="status"
          aria-live="polite"
        >
          <ElementEffectsList effects={endElementEffects} variant="strip" />
        </div>
      ) : null}
      {endSkillEffects?.length ? (
        <div
          className={cn(
            rankOutcomeBlockClass,
            "overflow-hidden border-(--accent-orb)/25 bg-(--accent-orb)/8",
          )}
          role="status"
          aria-live="polite"
        >
          <p className="mb-1.5 text-[0.6rem] font-semibold tracking-[0.14em] text-white/50 uppercase">
            Способности
          </p>
          <ElementEffectsList effects={endSkillEffects} variant="strip" />
        </div>
      ) : null}
      <div
        className={cn("mb-3 rounded-xl border px-4 py-3", tier.containerClass)}
        style={tier.pulse ? { boxShadow: tier.glowA } : undefined}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-semibold tracking-[0.16em] uppercase xl:text-sm",
                  tier.titleClass,
                )}
              >
                {tier.title}
              </span>
              {streak >= 3 ? (
                <span
                  className={cn(
                    "hidden items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.14em] sm:inline-flex",
                    tier.badgeClass,
                  )}
                >
                  {tier.badgeText}
                </span>
              ) : null}
            </div>
            <span className="mt-0.5 block text-[0.7rem] font-medium text-white/60 sm:text-xs">
              {tier.caption}
            </span>
          </div>
          <span
            className={cn(
              "shrink-0 text-base font-black tracking-tight tabular-nums xl:text-lg",
              tier.valueClass,
            )}
          >
            {streak}
          </span>
        </div>
      </div>
      {isTopThree ? (
        <div className="rounded-xl border border-(--accent-orb)/35 bg-(--accent-orb)/15 px-3.5 py-3 text-white/95 xl:rounded-2xl xl:px-5 xl:py-4">
          <p className="flex items-start gap-2 text-sm font-medium sm:text-[0.95rem] xl:gap-2.5 xl:text-base">
            <Crown className="mt-0.5 size-4 shrink-0 text-(--accent-orb) xl:mt-1 xl:size-5" />
            <span>{topMessage}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-white/90 sm:text-[0.95rem] xl:text-base">
            До следующего места:{" "}
            <span
              className="font-semibold"
              style={{
                color:
                  data.points_to_prev > 0
                    ? "var(--accent-orb)"
                    : "var(--accent-75)",
              }}
            >
              <div className="grid-cols grid grid-cols-[minmax(0,1fr)_0.875rem] items-center gap-1.5">
                <Suspense fallback={<span>0</span>}>
                  <CountText count={Math.max(0, data.points_to_prev)} />
                </Suspense>
                <PickaxeIcon tone="neutral" className="size-3.5" />
              </div>
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

ComponentWithRank.displayName = "ComponentWithRank";
export default ComponentWithRank;
