import type { IAnswer } from "@/interface/answer"
import { deleteAnswer, patchAnswers, postCreateAnswers } from "@/api/answers"
import type { IBodyCreateAnswer, SchemaAnswers } from "@/schemas/create-question"

interface IData {
  questionId: string
  answers: IAnswer[]
  values: SchemaAnswers
}

export async function updateAnswers({ values, answers, questionId }: IData) {
  const bodyNew: IBodyCreateAnswer[] = []
  const bodyUpdate: {
    id: string
    data: Partial<IBodyCreateAnswer>
  }[] = []
  const bodyDelete: string[] = []
  const answersById = new Map(answers.map((item) => [item.id, item]))

  for (const answer of values.answers) {
    const normalizedText = answer.text.trim()

    if (answer.id === "") {
      if (normalizedText === "") continue
      bodyNew.push({
        description: normalizedText,
        check: answer.isCorrect,
      })
      continue
    }
    if (answer.id !== "" && answer.id !== undefined) {
      const findAnswer = answersById.get(answer.id)
      if (!findAnswer) continue
      if (findAnswer.description === normalizedText && findAnswer.check === answer.isCorrect) continue
      if (normalizedText !== "") {
        const descChanged = findAnswer.description !== normalizedText
        const checkTrueToFalse = findAnswer.check === true && answer.isCorrect === false
        if (checkTrueToFalse && !descChanged) continue

        const data: Partial<IBodyCreateAnswer> = {}
        if (descChanged) data.description = normalizedText
        if (findAnswer.check !== answer.isCorrect && !checkTrueToFalse) data.check = answer.isCorrect

        if (Object.keys(data).length === 0) continue

        bodyUpdate.push({
          id: answer.id,
          data,
        })
      } else {
        bodyDelete.push(answer.id)
      }
      continue
    }
  }

  return Promise.all([
    bodyNew.length > 0 ? postCreateAnswers(bodyNew, questionId) : Promise.resolve(),
    bodyUpdate.length > 0
      ? patchAnswers(
          bodyUpdate.map((item) => ({ id: item.id, ...item.data })),
        )
      : Promise.resolve(),
    bodyDelete.length > 0 ? Promise.all(bodyDelete.map((item) => deleteAnswer(item))) : Promise.resolve(),
  ])
}
