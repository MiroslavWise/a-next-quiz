"use client"

import { useMemo } from "react"

import type { IAnswer } from "@/interface/answer"

interface IUseShuffledAnswersParams {
  answers: IAnswer[]
  questionId: string | undefined
  activeIndex: number
  tgId: number
}

/**
 * Детерминированный порядок ответов: одинаковый сид (вопрос + индекс + tgId) → одинаковая перестановка,
 * чтобы порядок не «прыгал» между рендерами, но был свой у каждого участника.
 */
export function useShuffledAnswers({ answers, questionId, activeIndex, tgId }: IUseShuffledAnswersParams) {
  return useMemo(() => {
    if (!answers.length) return []
    const seedStr = `${questionId ?? ""}|${activeIndex}|${tgId}`
    let hash = 0
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i)
      hash |= 0
    }

    const shuffled = [...answers]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const x = Math.sin(hash++) * 10000
      const pseudoRandom = x - Math.floor(x)

      const j = Math.floor(pseudoRandom * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
  }, [answers, questionId, activeIndex, tgId])
}
