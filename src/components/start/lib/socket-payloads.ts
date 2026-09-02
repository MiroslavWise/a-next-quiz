import { parseOptionalTelegramId } from "@/lib/normalize"

export function reportIdMatches(payloadReport: unknown, currentReportId: string | number): boolean {
  if (payloadReport === undefined || payloadReport === null) return true
  return String(payloadReport) === String(currentReportId)
}

export type LuckyBonusBurstPayload = {
  telegramId: number
  bonus: number
  index: number
}

export function parseLuckyBonusPayload(message: Record<string, unknown>): LuckyBonusBurstPayload | null {
  if (message.type !== "lucky-bonus") return null

  const telegramId = parseOptionalTelegramId(message.telegram_id)
  const bonusRaw = message.bonus
  const bonus = typeof bonusRaw === "number" ? bonusRaw : Number(bonusRaw)
  const indexRaw = message.index
  const index = typeof indexRaw === "number" ? indexRaw : Number(indexRaw)

  if (telegramId === null || !Number.isFinite(bonus) || bonus <= 0 || !Number.isFinite(index) || index < 0) return null

  return { telegramId, bonus: Math.trunc(bonus), index: Math.trunc(index) }
}

/** Автокик за три пропуска с Q0 — см. docs/API.md (`user-removed`). */
export const USER_REMOVED_REASON_NO_ANSWERS_START = "no_answers_start" as const

export type UserRemovedReason = typeof USER_REMOVED_REASON_NO_ANSWERS_START

export type UserRemovedPayload = {
  telegramId: number
  reason?: UserRemovedReason
  status?: string
}

export function parseUserRemovedPayload(message: Record<string, unknown>): UserRemovedPayload | null {
  if (message.type !== "user-removed") return null

  const telegramId = parseOptionalTelegramId(message.telegram_id)
  if (telegramId === null) return null

  const reasonRaw = message.reason
  const reason = reasonRaw === USER_REMOVED_REASON_NO_ANSWERS_START ? USER_REMOVED_REASON_NO_ANSWERS_START : undefined

  const statusRaw = message.status
  const status = typeof statusRaw === "string" && statusRaw.length > 0 ? statusRaw : undefined

  return { telegramId, reason, status }
}
