import getApiHeaders from "./api-headers"
import type { IAnswer } from "@/interface/answer"
import { api } from "./instance"
import type { IQuestion, IQuestionWithAnswers } from "@/interface/question"
import type { CreateQuestionFormData } from "@/schemas/create-question"

export const postCreateQuestion = (data: CreateQuestionFormData) => {
  return api
    .post(
      "/questions",
      {
        ...data,
      },
      {
        headers: getApiHeaders(),
      },
    )
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IQuestion
      throw new Error("Failed to post question")
    })
}

export const getQuestions = (quizId: string) => {
  return api
    .get(`/questions`, {
      params: {
        quizId,
      },
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IQuestion[]
      throw new Error("Failed to get questions")
    })
}

export const getQuestionById = (questionId: string) => {
  return api
    .get(`/questions/${questionId}`, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300)
        return res.data as {
          question: IQuestion
          answers: IAnswer[]
        }
      throw new Error("Failed to get question by id")
    })
}

export const deleteQuestion = (questionId: string) => {
  return api
    .delete(`/questions/${questionId}`, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status === 204) return "OK"
      throw new Error("Failed to update question")
    })
}

export const patchQuestion = (questionId: string, body: Partial<IQuestion>) => {
  return api
    .patch(`/questions/${questionId}`, body, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IQuestion
      throw new Error("Failed to patch question")
    })
}
