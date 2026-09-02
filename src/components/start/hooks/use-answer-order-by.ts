"use client"

import { useMemo } from "react"

import { normalizeTelegramId } from "@/lib/normalize"

export function useAnswerOrderBy(answers: number[]): Map<number, number> {
  return useMemo(() => {
    const map = new Map<number, number>()
    if (!answers?.length) return map
    for (let index = 0; index < answers.length; index++) {
      const n = normalizeTelegramId(answers[index])
      if (Number.isFinite(n)) map.set(n, index + 1)
    }
    return map
  }, [answers])
}
