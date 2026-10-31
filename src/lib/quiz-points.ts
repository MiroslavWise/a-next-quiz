/** Форматирование очков квиза — см. `total_points` / `points` в docs/API.md (могут быть отрицательными). */
export function formatQuizPoints(points: number): string {
  if (points === 0) return "0"
  return points.toLocaleString("ru-RU")
}

export function isNegativeQuizPoints(points: number): boolean {
  return Number.isFinite(points) && points < 0
}

/** Золотая кирка — очки ≥ 0. */
export const PICKAXE_ICON_POSITIVE_CLASS = "text-[#FFD700]"

/** Алокрасная кирка — отрицательные начисления и итог. */
export const PICKAXE_ICON_NEGATIVE_CLASS = "text-[#FF2400]"

/** Серебряная кирка — нейтральный контекст (например, «до следующего места»). */
export const PICKAXE_ICON_NEUTRAL_CLASS = "text-slate-300"

export type PickaxeIconTone = "positive" | "negative" | "neutral"

export function pickaxeIconClassForPoints(points: number): string {
  return isNegativeQuizPoints(points) ? PICKAXE_ICON_NEGATIVE_CLASS : PICKAXE_ICON_POSITIVE_CLASS
}

export function pickaxeIconClass({ points, tone }: { points?: number; tone?: PickaxeIconTone }): string {
  if (tone === "neutral") return PICKAXE_ICON_NEUTRAL_CLASS
  if (tone === "negative") return PICKAXE_ICON_NEGATIVE_CLASS
  if (tone === "positive") return PICKAXE_ICON_POSITIVE_CLASS
  if (points !== undefined) return pickaxeIconClassForPoints(points)
  return PICKAXE_ICON_POSITIVE_CLASS
}

/** Класс акцента для итога / строки очков (без анимаций). */
export function quizPointsToneClass(points: number, positiveClass = "text-white", negativeClass = "text-rose-300"): string {
  return isNegativeQuizPoints(points) ? negativeClass : positiveClass
}
