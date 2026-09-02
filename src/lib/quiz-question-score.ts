import type { IReportQuestionScore } from "@/api/reports"
import { formatQuizPoints } from "@/lib/quiz-points"

/** Пропуск / воздержание — см. docs/API.md (`abstained: true` или `is_right: false` без клика). */
export function isReportQuestionAbstained(q: IReportQuestionScore): boolean {
  if (q.abstained === true) return true
  return q.is_right === false && q.answered === false
}

/** Неверный ответ по клику — `is_right: false` без `abstained`. */
export function isReportQuestionWrong(q: IReportQuestionScore): boolean {
  return q.is_right === false && !isReportQuestionAbstained(q)
}

export function reportQuestionScoreVariant(q: IReportQuestionScore): "ok" | "bad" | "muted" {
  if (q.is_right === true) return "ok"
  if (isReportQuestionAbstained(q)) return "muted"
  if (isReportQuestionWrong(q)) return "bad"
  return "muted"
}

export function reportQuestionScoreLabel(q: IReportQuestionScore): string {
  if (isReportQuestionAbstained(q)) {
    return q.points != null ? `Воздержался (пропустил) · ${formatQuizPoints(q.points)}` : "Воздержался (пропустил)"
  }
  if (!q.answered) return "Не ответил"
  if (q.points != null) return formatQuizPoints(q.points)
  return "—"
}

export function reportQuestionScoreBreakdown(questions: IReportQuestionScore[] | undefined) {
  let right = 0
  let wrong = 0
  let abstained = 0

  for (const q of questions ?? []) {
    if (q.is_right === true) right++
    else if (isReportQuestionAbstained(q)) abstained++
    else if (isReportQuestionWrong(q)) wrong++
  }

  return { right, wrong, abstained }
}
