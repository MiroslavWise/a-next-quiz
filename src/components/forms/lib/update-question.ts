import { patchQuestion } from "@/api/questions"
import { questionBonusesEqual, questionBonusesToApi } from "@/enum/question-bonus"
import type { IQuestion } from "@/interface/question"
import type { CreateQuestionFormDataWithAnswers } from "@/schemas/create-question"

interface IData {
  question: IQuestion
  data: CreateQuestionFormDataWithAnswers
}

export async function updateQuestion({ question, data }: IData) {
  const body: Partial<IQuestion> = {}

  if (!!data.title && data.title.trim() !== question.title) body.title = data.title.trim()
  if (!!data.time && data.time !== question.time) body.time = data.time
  if (!!data.points && data.points !== question.points) body.points = data.points
  if (!questionBonusesEqual(data.bonuses, question.bonuses)) body.bonuses = questionBonusesToApi(data.bonuses)

  if (Object.keys(body).length !== 0) return patchQuestion(question.id, body)
  return Promise.resolve(question)
}
