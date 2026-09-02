import type { IPrizesUsers } from "@/api/reports"

/**
 * Минимальная доля верных ответов (в %) по закрытым вопросам для участия в розыгрыше случайного приза.
 * Порог включительный; если ни один вопрос не был сыгран, он не применяется (см. docs/API.md).
 */
export const RANDOM_PRIZE_MIN_CORRECT_PERCENT = 55

/** Случайный приз в `GET /report/{id}/prizes-users`: `place: 0` и `is_random: true`. */
export function isRandomPrizeEntry(winner: Pick<IPrizesUsers, "place" | "is_random">): boolean {
  return winner.place === 0 && winner.is_random === true
}

export function randomPrizeWinnerIds(winners: IPrizesUsers[] | undefined): Set<number> {
  return new Set(
    (winners ?? [])
      .filter(isRandomPrizeEntry)
      .map((w) => Number(w.telegram_id))
      .filter(Number.isFinite),
  )
}

export function findPrizeEntryForUser(winners: IPrizesUsers[] | undefined, tgId: number): IPrizesUsers | undefined {
  return winners?.find((w) => Number(w.telegram_id) === tgId)
}

export function sortPrizeWinners(winners: IPrizesUsers[]): IPrizesUsers[] {
  return winners.toSorted((a, b) => {
    const pa = isRandomPrizeEntry(a) ? Number.MAX_SAFE_INTEGER : a.place
    const pb = isRandomPrizeEntry(b) ? Number.MAX_SAFE_INTEGER : b.place
    return pa - pb
  })
}
