import { yupResolver } from "@hookform/resolvers/yup"
import { object, string, number, array, boolean, mixed, type InferType } from "yup"

import { Time } from "@/enum/time"
import { Points } from "@/enum/points"
import { QuestionBonus } from "@/enum/question-bonus"

const schema = object({
  title: string()
    .required("Вопрос является обязательным")
    .min(3, "Вопрос должен быть не менее 3 символов")
    .max(200, "Вопрос не может превышать 200 символов")
    .default(""),
  quizId: string().required("Квиз является обязательным").default(""),
  time: number().required("Время является обязательным").default(Time.HIGH),
  points: number().required("Количество очков является обязательным").default(Points.HIGH),
  bonuses: array()
    .of(mixed<QuestionBonus>().oneOf(Object.values(QuestionBonus)).required())
    .default([])
    .nullable(),
})

const schemaWithAnswers = object({
  answers: array()
    .of(
      object({
        id: string().default(""),
        text: string().default(""),
        isCorrect: boolean().default(false),
      }),
    )
    .required()
    .default([])
    .min(1, "Необходимо добавить хотя бы один ответ"),
})

export interface IBodyCreateAnswer {
  description: string
  check: boolean
}

const mergedSchema = schema.concat(schemaWithAnswers).test("answers-validation", function (value) {
  const answers = value?.answers

  const nonEmptyAnswersCount = answers?.filter((answer) => answer.text.trim() !== "").length ?? 0
  if (nonEmptyAnswersCount < 2) {
    console.warn("nonEmptyAnswersCount", nonEmptyAnswersCount)
    return this.createError({ path: "answers", message: "Необходимо добавить хотя бы 2 ответа" })
  }

  const correctAnswersCount = answers?.filter((answer) => answer.isCorrect).length ?? 0
  if (correctAnswersCount !== 1) {
    console.warn("correctAnswersCount", correctAnswersCount)
    return this.createError({ path: "answers", message: "Необходимо выбрать только один правильный ответ" })
  }

  const firstCorrectButEmptyIndex = answers?.findIndex((answer) => answer.isCorrect && answer.text.trim() === "") ?? -1
  if (firstCorrectButEmptyIndex !== -1) {
    console.warn("firstCorrectButEmptyIndex", firstCorrectButEmptyIndex)
    return this.createError({
      path: `answers`,
      message: "Заполните текст ответа, отмеченного как правильный",
    })
  }

  return true
})

export type CreateQuestionFormData = InferType<typeof schema>

export type CreateQuestionFormDataWithAnswers = InferType<typeof mergedSchema>
export const resolverCreateQuestionFormDataWithAnswers = yupResolver(mergedSchema)

export type SchemaAnswers = InferType<typeof schemaWithAnswers>
