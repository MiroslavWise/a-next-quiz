import { api } from "./instance"
import getApiHeaders from "./api-headers"

const uri = "/ai-support"

interface Payload {
  question: string
  answer: string
}

export const postAISupport = async (body: Payload) =>
  api.post<string[]>(uri, body, { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as string[]
    throw new Error("Failed to support")
  })
