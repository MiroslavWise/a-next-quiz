"use client"

import { useEffect, useReducer, useRef } from "react"

type BonusPayload = { points: number; index: number; percent: number }
type BonusState = BonusPayload | null
type BonusAction = { type: "CLEAR" } | { type: "SET"; payload: BonusPayload }

function bonusReducer(_state: BonusState, action: BonusAction): BonusState {
  switch (action.type) {
    case "CLEAR":
      return null
    case "SET":
      return action.payload
    default:
      return null
  }
}

type LuckyBonusPayload = { points: number; index: number }
type LuckyBonusState = LuckyBonusPayload | null
type LuckyBonusAction = { type: "CLEAR" } | { type: "SET"; payload: LuckyBonusPayload }

function luckyBonusReducer(_state: LuckyBonusState, action: LuckyBonusAction): LuckyBonusState {
  switch (action.type) {
    case "CLEAR":
      return null
    case "SET":
      return action.payload
    default:
      return null
  }
}

export interface IRankBonusSource {
  streak_bonus_points?: number
  streak_bonus_index?: number
  streak_bonus_percent?: number
  lucky_bonus_points?: number
}

interface IUseRankBonusesParams {
  activeIndex: number
  data: IRankBonusSource | undefined
  isTopThree: boolean
}

/** Transient-состояние бонусов серии и lucky-draw из ответа `GET /report/{id}/my-rank`. */
export function useRankBonuses({ activeIndex, data, isTopThree }: IUseRankBonusesParams) {
  const [bonus, dispatchBonus] = useReducer(bonusReducer, null)
  const [luckyBonus, dispatchLuckyBonus] = useReducer(luckyBonusReducer, null)
  const bonusKeyRef = useRef<string | null>(null)
  const luckyBonusKeyRef = useRef<string | null>(null)

  useEffect(() => {
    bonusKeyRef.current = null
    luckyBonusKeyRef.current = null
    dispatchBonus({ type: "CLEAR" })
    dispatchLuckyBonus({ type: "CLEAR" })
  }, [activeIndex])

  useEffect(() => {
    if (!data) return

    const points = Number(data.streak_bonus_points ?? 0) || 0
    const index = Number(data.streak_bonus_index ?? -1)
    const percent = Number(data.streak_bonus_percent ?? 0) || 0

    if (index < 0 || points <= 0 || percent <= 0) {
      dispatchBonus({ type: "CLEAR" })
      return
    }

    if (index !== activeIndex) {
      dispatchBonus({ type: "CLEAR" })
      return
    }

    const key = `${index}:${points}:${percent}`
    if (bonusKeyRef.current === key) return
    bonusKeyRef.current = key

    dispatchBonus({ type: "SET", payload: { points, index, percent } })
    const t = window.setTimeout(() => dispatchBonus({ type: "CLEAR" }), 3200)
    return () => window.clearTimeout(t)
  }, [activeIndex, data?.streak_bonus_index, data?.streak_bonus_points, data?.streak_bonus_percent])

  useEffect(() => {
    if (!data) return

    const points = Number(data.lucky_bonus_points ?? 0) || 0
    if (points <= 0) return

    const key = `${activeIndex}:${points}`
    if (luckyBonusKeyRef.current === key) return
    luckyBonusKeyRef.current = key

    dispatchLuckyBonus({ type: "SET", payload: { points, index: activeIndex } })
  }, [activeIndex, data?.lucky_bonus_points])

  const luckyDrawPending = !isTopThree && !luckyBonus && (Number(data?.lucky_bonus_points ?? 0) || 0) <= 0

  return { bonus, luckyBonus, luckyDrawPending }
}
