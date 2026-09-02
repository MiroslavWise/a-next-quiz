"use client"

import { useEffect, useReducer, useRef } from "react"

import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"

import { parseLuckyBonusPayload } from "../lib/socket-payloads"

const VISIBLE_MS = 6_500

export type LuckyBurst = {
  id: string
  telegramId: number
  bonus: number
  index: number
}

type BurstState = LuckyBurst[]

type BurstAction = { type: "ADD"; payload: LuckyBurst } | { type: "REMOVE"; id: string } | { type: "CLEAR" }

function burstReducer(state: BurstState, action: BurstAction): BurstState {
  switch (action.type) {
    case "ADD":
      return state.some((b) => b.id === action.payload.id) ? state : [...state, action.payload]
    case "REMOVE":
      return state.filter((b) => b.id !== action.id)
    case "CLEAR":
      return []
    default:
      return state
  }
}

interface IUseLuckyBonusBurstsParams {
  lastByType: LastSocketEventByType<QuizEvent>
  activeIndex: number
  isQuestionEnded: boolean
}

/** Всплывающие карточки lucky-bonus по сокет-событию. */
export function useLuckyBonusBursts({ lastByType, activeIndex, isQuestionEnded }: IUseLuckyBonusBurstsParams) {
  const [bursts, dispatchBursts] = useReducer(burstReducer, [])
  const timersRef = useRef<Map<string, number>>(new Map())
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      timersRef.current.forEach((t) => window.clearTimeout(t))
      timersRef.current.clear()
    }
  }, [])

  useEffect(() => {
    dispatchBursts({ type: "CLEAR" })
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current.clear()
  }, [activeIndex])

  useSocketEventEffect(
    lastByType,
    "lucky-bonus",
    (event) => {
      if (!isQuestionEnded) return

      const parsed = parseLuckyBonusPayload(event as Record<string, unknown>)
      if (!parsed) return
      if (parsed.index !== activeIndex) return

      const burst: LuckyBurst = {
        id: `${parsed.index}:${parsed.telegramId}:${parsed.bonus}`,
        ...parsed,
      }

      dispatchBursts({ type: "ADD", payload: burst })

      if (timersRef.current.has(burst.id)) return

      const timer = window.setTimeout(() => {
        if (!mountedRef.current) return
        dispatchBursts({ type: "REMOVE", id: burst.id })
        timersRef.current.delete(burst.id)
      }, VISIBLE_MS)
      timersRef.current.set(burst.id, timer)
    },
    [activeIndex, isQuestionEnded],
  )

  return { bursts }
}
