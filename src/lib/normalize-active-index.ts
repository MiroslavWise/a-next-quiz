import type { IReportActiveIndexResponse } from "@/api/reports"
import { normalizeQuestionBonuses } from "@/enum/question-bonus"
import type { IQuestion } from "@/interface/question"

function normalizeSnapshotQuestion(question: IQuestion): IQuestion {
  const bonuses = normalizeQuestionBonuses(question.bonuses)
  if (bonuses.length === 0) {
    const { bonuses: _removed, ...rest } = question
    return rest as IQuestion
  }
  return { ...question, bonuses }
}

/** Нормализует снимок `active-index` / `data` из Socket.IO (в т.ч. `question.bonuses`). */
export function normalizeActiveIndexSnapshot(payload: IReportActiveIndexResponse): IReportActiveIndexResponse {
  return {
    ...payload,
    question: normalizeSnapshotQuestion(payload.question),
  }
}
