import type { IReportActiveIndexResponse } from "@/api/reports"
import { normalizeQuestionBonuses } from "@/enum/question-bonus"
import type { IQuestion } from "@/interface/question"
import { questionElementId } from "@/lib/question-element"

function normalizeSnapshotQuestion(question: IQuestion): IQuestion {
  const bonuses = normalizeQuestionBonuses(question.bonuses)
  const element = questionElementId(question.element)
  const { bonuses: _bonuses, element: _element, ...rest } = question
  return {
    ...rest,
    ...(bonuses.length > 0 ? { bonuses } : {}),
    ...(element ? { element } : {}),
  }
}

/** Нормализует снимок `active-index` / `data` из Socket.IO (в т.ч. `question.bonuses`). */
export function normalizeActiveIndexSnapshot(payload: IReportActiveIndexResponse): IReportActiveIndexResponse {
  return {
    ...payload,
    question: normalizeSnapshotQuestion(payload.question),
  }
}
