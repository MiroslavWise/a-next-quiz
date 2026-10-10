import { EUsersAnswerStatus, type IReportUsersAnswersStatus } from "@/api/reports"

export type QuestionOutcomeStats = {
  index: number
  right: number
  wrong: number
  skipped: number
  total: number
  rightPct: number
  wrongPct: number
  skippedPct: number
}

function pct(part: number, total: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

/** Сводка верно / неверно / пропуск по закрытым вопросам из матрицы `users-answers-status`. */
export function aggregateQuestionOutcomeStats(matrix: IReportUsersAnswersStatus | undefined): QuestionOutcomeStats[] {
  const byIndex = new Map<number, { right: number; wrong: number; skipped: number }>()

  if (!matrix) return []

  for (const row of Object.values(matrix)) {
    for (const [indexKey, entry] of Object.entries(row)) {
      const index = Number(indexKey)
      if (!Number.isFinite(index)) continue

      const bucket = byIndex.get(index) ?? { right: 0, wrong: 0, skipped: 0 }
      if (entry.result === EUsersAnswerStatus.CORRECT) bucket.right += 1
      else if (entry.result === EUsersAnswerStatus.WRONG) bucket.wrong += 1
      else if (entry.result === EUsersAnswerStatus.SKIPPED) bucket.skipped += 1
      byIndex.set(index, bucket)
    }
  }

  return [...byIndex.entries()]
    .toSorted((a, b) => a[0] - b[0])
    .map(([index, bucket]) => {
      const total = bucket.right + bucket.wrong + bucket.skipped
      return {
        index,
        right: bucket.right,
        wrong: bucket.wrong,
        skipped: bucket.skipped,
        total,
        rightPct: pct(bucket.right, total),
        wrongPct: pct(bucket.wrong, total),
        skippedPct: pct(bucket.skipped, total),
      }
    })
}
