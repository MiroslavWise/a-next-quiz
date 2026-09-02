import getApiHeaders from "./api-headers"
import type { IBodyCreateAnswer } from "@/schemas/create-question"
import { api } from "./instance"
import type { IAnswer } from "@/interface/answer"

export const postCreateAnswers = async (data: IBodyCreateAnswer[], questionId: string) => {
  return api
    .post<IBodyCreateAnswer[]>(`/answers`, data, {
      params: {
        questionId,
      },
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data
      throw new Error("Failed to post answer")
    })
}

export type IPatchAnswerItem = { id: string } & Partial<IBodyCreateAnswer>

export const patchAnswers = async (body: IPatchAnswerItem[]) => {
  const res = await api.patch<IAnswer[]>(`/answers`, body, { headers: getApiHeaders() })
  if (res.status >= 200 && res.status < 300) return res.data
  throw new Error("Failed to patch answers")
}

export const getAnswers = async (questionId: string) => {
  return api.get(`/answers`, { params: { questionId }, headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IAnswer[]
    throw new Error("Failed to get answers")
  })
}

export const deleteAnswer = async (answerId: string) => {
  return api.delete(`/answers/${answerId}`, { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return "OK"
    throw new Error("Failed to delete answer")
  })
}
