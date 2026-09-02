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

/** Ранги серии — от старшего к младшему (для списков в UI). */
export const STREAK_TIER_DEFINITIONS: readonly StreakTierDefinition[] = [
  {
    minStreak: 8,
    maxStreak: null,
    rangeLabel: "8+ верных подряд",
    title: "Titan",
    badgeText: "TITAN",
    containerClass: "border-red-500/40 bg-red-950/25",
    titleClass: "text-red-400 font-bold tracking-wide uppercase",
    valueClass: "text-red-300",
    badgeClass: "border-red-500/30 bg-red-500/15 text-red-300",
    pulse: true,
    glowA: "0 0 24px rgba(239,68,68,0.22), 0 0 56px rgba(220,38,38,0.16)",
    glowB: "0 0 32px rgba(239,68,68,0.30), 0 0 72px rgba(220,38,38,0.22)",
  },
  {
    minStreak: 7,
    maxStreak: 7,
    rangeLabel: "7 верных подряд",
    title: "Legend",
    badgeText: "LEGEND",
    containerClass: "border-pink-500/40 bg-pink-950/25",
    titleClass: "text-pink-400 font-bold tracking-wide uppercase",
    valueClass: "text-pink-300",
    badgeClass: "border-pink-500/30 bg-pink-500/15 text-pink-300",
    pulse: true,
    glowA: "0 0 22px rgba(236,72,153,0.20), 0 0 52px rgba(232,121,249,0.14)",
    glowB: "0 0 30px rgba(236,72,153,0.28), 0 0 68px rgba(232,121,249,0.20)",
  },
  {
    minStreak: 6,
    maxStreak: 6,
    rangeLabel: "6 верных подряд",
    title: "Expert",
    badgeText: "EXPERT",
    containerClass: "border-rose-600/40 bg-rose-950/25",
    titleClass: "text-rose-400 font-bold tracking-wide uppercase",
    valueClass: "text-rose-300",
    badgeClass: "border-rose-500/30 bg-rose-500/15 text-rose-300",
    pulse: true,
    glowA: "0 0 20px rgba(244,63,94,0.18), 0 0 48px rgba(225,29,72,0.12)",
    glowB: "0 0 28px rgba(244,63,94,0.26), 0 0 62px rgba(225,29,72,0.18)",
  },
  {
    minStreak: 5,
    maxStreak: 5,
    rangeLabel: "5 верных подряд",
    title: "Master",
    badgeText: "MASTER",
    containerClass: "border-amber-500/40 bg-amber-950/25",
    titleClass: "text-amber-400 font-bold tracking-wide uppercase",
    valueClass: "text-amber-300",
    badgeClass: "border-amber-500/30 bg-amber-500/15 text-amber-300",
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
    containerClass: "border-purple-500/40 bg-purple-950/25",
    titleClass: "text-purple-400 font-bold tracking-wide uppercase",
    valueClass: "text-purple-300",
    badgeClass: "border-purple-500/30 bg-purple-500/15 text-purple-300",
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
    containerClass: "border-blue-500/40 bg-blue-950/25",
    titleClass: "text-blue-400 font-bold tracking-wide uppercase",
    valueClass: "text-blue-300",
    badgeClass: "border-blue-500/30 bg-blue-500/15 text-blue-300",
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
    containerClass: "border-emerald-500/35 bg-emerald-950/25",
    titleClass: "text-emerald-400 font-bold tracking-wide uppercase",
    valueClass: "text-emerald-300",
    badgeClass: "border-emerald-500/25 bg-emerald-500/12 text-emerald-300",
    pulse: false,
    glowA: "none",
    glowB: "none",
  },
] as const

const WARMUP_TIER: StreakTierStyles & { caption: (streak: number) => string } = {
  title: "Warm-up",
  badgeText: "START",
  containerClass: "border-white/12 bg-white/5",
  titleClass: "text-white/60 font-semibold tracking-wide uppercase",
  valueClass: "text-white/80",
  badgeClass: "border-white/15 bg-white/8 text-white/75",
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
