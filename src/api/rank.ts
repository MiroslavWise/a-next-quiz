import getApiHeaders from "./api-headers"
import { reportPath } from "./report-path"
import { api } from "./instance"
import type { ISkillEffect } from "./reports"
import type { IElementEffect } from "@/interface/element-effect"

export interface IRank {
  telegram_id: `${number}`
  /** Сумма очков; может быть отрицательной — см. docs/API.md (`GET …/my-rank`). */
  total_points: number
  rank: number
  points_to_prev: number
  streak: number
  /** Процент бонуса, применённого к ответу (по умолчанию 0) */
  streak_bonus_percent: number
  /** Сколько бонусных очков начислено (по умолчанию 0) */
  streak_bonus_points: number
  /** Индекс вопроса, куда добавлен бонус (по умолчанию -1) */
  streak_bonus_index: number
  /** Случайный бонус за закрытый вопрос (0 — не выпал; >0 — выигрыш в розыгрыше) */
  lucky_bonus_points: number
  /** Полный список эффектов за последний закрытый вопрос с ответом — см. docs/API.md. */
  element_effects?: IElementEffect[]
  /** Индекс вопроса для `element_effects` (последний END с ответом). */
  element_effects_index?: number
  /** Эффекты одноразовых способностей за тот же закрытый вопрос — см. docs/API.md. */
  skill_effects?: ISkillEffect[]
}

export const getRank = async (reportId: string) => {
  return api
    .get(reportPath(reportId, "my-rank"), {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IRank
      throw new Error("Failed to get rank")
    })
}
