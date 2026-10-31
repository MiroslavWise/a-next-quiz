/** Случайный бонус в конце вопроса (см. docs/API.md — `lucky_bonus_points`). */
export const LUCKY_BONUS_PERCENT = 12

/** Максимальный процент бонуса за серию верных ответов. */
export const STREAK_BONUS_MAX_PERCENT = 35

/** С какого номера подряд верного ответа начинается бонус (+5% на 2-м, +10% на 3-м и т.д.). */
export const STREAK_BONUS_FROM_STREAK = 2

/** Шаг увеличения процента бонуса за серию. */
export const STREAK_BONUS_STEP_PERCENT = 5

export const CHECKING_WINDOW_SECONDS = 45
export const START_SPLASH_SECONDS = 5

export type StreakTierStyles = {
  title: string
  badgeText: string
  containerClass: string
  titleClass: string
  valueClass: string
  badgeClass: string
  pulse: boolean
  glowA: string
  glowB: string
}

export type StreakTierDefinition = StreakTierStyles & {
  /** Минимальная длина серии для этого ранга (включительно). */
  minStreak: number
  /** Верхняя граница серии (включительно); `null` — без верхней границы. */
  maxStreak: number | null
  /** Подпись для экрана механики. */
  rangeLabel: string
}

const streakCaption = (streak: number) => `${streak} верных подряд`

/** Процент бонуса за серию по длине streak (0 для streak < 2). */
export function streakBonusPercent(streak: number): number {
  if (streak < STREAK_BONUS_FROM_STREAK) return 0
  return Math.min((streak - 1) * STREAK_BONUS_STEP_PERCENT, STREAK_BONUS_MAX_PERCENT)
}

/** Ранги серии — от старшего к младшему (для списков в UI). Без glow/pulse — neo-brutal. */
export const STREAK_TIER_DEFINITIONS: readonly StreakTierDefinition[] = [
  {
    minStreak: 8,
    maxStreak: null,
    rangeLabel: "8+ верных подряд",
    title: "Titan",
    badgeText: "TITAN",
    containerClass: "border-2 border-black/80 bg-[#121418]",
    titleClass: "text-red-300 font-bold tracking-wide uppercase",
    valueClass: "text-red-200",
    badgeClass: "border-2 border-black/80 bg-[#1a1012] text-red-200",
    pulse: false,
    glowA: "none",
    glowB: "none",
  },
  {
    minStreak: 7,
    maxStreak: 7,
    rangeLabel: "7 верных подряд",
    title: "Legend",
    badgeText: "LEGEND",
    containerClass: "border-2 border-black/80 bg-[#121418]",
    titleClass: "text-pink-300 font-bold tracking-wide uppercase",
    valueClass: "text-pink-200",
    badgeClass: "border-2 border-black/80 bg-[#1a1018] text-pink-200",
    pulse: false,
    glowA: "none",
    glowB: "none",
  },
  {
    minStreak: 6,
    maxStreak: 6,
    rangeLabel: "6 верных подряд",
    title: "Expert",
    badgeText: "EXPERT",
    containerClass: "border-2 border-black/80 bg-[#121418]",
    titleClass: "text-rose-300 font-bold tracking-wide uppercase",
    valueClass: "text-rose-200",
    badgeClass: "border-2 border-black/80 bg-[#1a1012] text-rose-200",
    pulse: false,
    glowA: "none",
    glowB: "none",
  },
  {
    minStreak: 5,
    maxStreak: 5,
    rangeLabel: "5 верных подряд",
    title: "Master",
    badgeText: "MASTER",
    containerClass: "border-2 border-black/80 bg-[#121418]",
    titleClass: "text-amber-200 font-bold tracking-wide uppercase",
    valueClass: "text-amber-100",
    badgeClass: "border-2 border-black/80 bg-[#18140e] text-amber-100",
    pulse: false,
    glowA: "none",
    glowB: "none",
  },
  {
    minStreak: 4,
    maxStreak: 4,
    rangeLabel: "4 верных подряд",
    title: "Intellect",
    badgeText: "INTELLECT",
    containerClass: "border-2 border-black/80 bg-[#121418]",
    titleClass: "text-purple-200 font-bold tracking-wide uppercase",
    valueClass: "text-purple-100",
    badgeClass: "border-2 border-black/80 bg-[#141018] text-purple-100",
    pulse: false,
    glowA: "none",
    glowB: "none",
  },
  {
    minStreak: 3,
    maxStreak: 3,
    rangeLabel: "3 верных подряд",
    title: "Analyst",
    badgeText: "ANALYST",
    containerClass: "border-2 border-black/80 bg-[#121418]",
    titleClass: "text-sky-200 font-bold tracking-wide uppercase",
    valueClass: "text-sky-100",
    badgeClass: "border-2 border-black/80 bg-[#0e1418] text-sky-100",
    pulse: false,
    glowA: "none",
    glowB: "none",
  },
  {
    minStreak: 2,
    maxStreak: 2,
    rangeLabel: "2 верных подряд",
    title: "Scholar",
    badgeText: "SCHOLAR",
    containerClass: "border-2 border-black/80 bg-[#121418]",
    titleClass: "text-emerald-200 font-bold tracking-wide uppercase",
    valueClass: "text-emerald-100",
    badgeClass: "border-2 border-black/80 bg-[#0e1612] text-emerald-100",
    pulse: false,
    glowA: "none",
    glowB: "none",
  },
] as const

const WARMUP_TIER: StreakTierStyles & { caption: (streak: number) => string } = {
  title: "Warm-up",
  badgeText: "START",
  containerClass: "border-2 border-black/80 bg-[#121418]",
  titleClass: "text-white/70 font-semibold tracking-wide uppercase",
  valueClass: "text-white/85",
  badgeClass: "border-2 border-black/80 bg-[#161616] text-white/75",
  pulse: false,
  glowA: "none",
  glowB: "none",
  caption: (streak) => (streak === 1 ? "Правильный ответ" : "Отвечайте без ошибок"),
}

export type ResolvedStreakTier = StreakTierStyles & {
  caption: string
}

/** Текущий визуальный ранг серии для игрового UI. */
export function getStreakTier(streak: number): ResolvedStreakTier {
  const normalized = Math.max(0, Math.trunc(streak))

  for (const tier of STREAK_TIER_DEFINITIONS) {
    if (normalized >= tier.minStreak && (tier.maxStreak === null || normalized <= tier.maxStreak)) {
      return {
        title: tier.title,
        badgeText: tier.badgeText,
        containerClass: tier.containerClass,
        titleClass: tier.titleClass,
        valueClass: tier.valueClass,
        badgeClass: tier.badgeClass,
        pulse: tier.pulse,
        glowA: tier.glowA,
        glowB: tier.glowB,
        caption: streakCaption(normalized),
      }
    }
  }

  return {
    ...WARMUP_TIER,
    caption: WARMUP_TIER.caption(normalized),
  }
}
