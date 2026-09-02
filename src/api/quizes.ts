import { api } from "./instance"
import getApiHeaders from "./api-headers"
import type { IQuiz } from "@/interface/quiz"
import type { CreateQuizFormData } from "@/schemas/create-quiz"

export const getQuizes = () => {
  return api
    .get("/quizes", {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IQuiz[]
      throw new Error("Failed to get quizes")
    })
}

export const getQuizById = (quizId: string) => {
  return api
    .get(`/quizes`, {
      params: {
        id: quizId,
      },
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IQuiz
      throw new Error("Failed to get quiz by id")
    })
}

export const postQuiz = (data: CreateQuizFormData) => {
  return api
    .post(
      "quizes",
      {
        ...data,
      },
      {
        headers: getApiHeaders(),
      },
    )
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IQuiz
      throw new Error("Failed to post quiz")
    })
}

export const deleteQuiz = (quizId: string) => {
  return api
    .delete(`/quizes/${quizId}`, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return "OK"
      throw new Error("Failed to delete quiz")
    })
}
