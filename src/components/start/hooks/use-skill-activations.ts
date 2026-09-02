"use client"

import { useMemo, useState } from "react"

import type { SkillId } from "@/api/reports"
import { GAME_SKILLS } from "@/enum/game-skill"
import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizStaffEvent } from "@/hooks/useQuizStaffSocketIO"

const SKILL_IDS = new Set<string>(GAME_SKILLS.map((skill) => skill.id))

function isSkillId(value: unknown): value is SkillId {
  return typeof value === "string" && SKILL_IDS.has(value)
}

function parseTelegramId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export type SkillActivation = {
  telegramId: number
  skillId: SkillId
}

export interface IUseSkillActivationsParams {
  lastStaffByType: LastSocketEventByType<QuizStaffEvent>
  activeIndex: number
}

/**
 * Live-активации способностей на текущем вопросе из `quiz:staff-event` (`skill-activated`).
 * Сбрасывается при смене `activeIndex`.
 */
export function useSkillActivations({ lastStaffByType, activeIndex }: IUseSkillActivationsParams) {
  const [activations, setActivations] = useState<SkillActivation[]>([])
  const [trackedIndex, setTrackedIndex] = useState(activeIndex)

  if (trackedIndex !== activeIndex) {
    setTrackedIndex(activeIndex)
    if (activations.length > 0) setActivations([])
  }

  useSocketEventEffect(
    lastStaffByType,
    "skill-activated",
    (msg) => {
      if (typeof msg.index !== "number" || msg.index !== activeIndex) return
      if (!isSkillId(msg.skill_id)) return

      const telegramId = parseTelegramId(msg.telegram_id)
      if (telegramId == null) return

      setActivations((prev) => {
        if (prev.some((item) => item.telegramId === telegramId)) return prev
        return [...prev, { telegramId, skillId: msg.skill_id as SkillId }]
      })
    },
    [activeIndex],
  )

  const bySkillId = useMemo(() => {
    const map = new Map<SkillId, number[]>()
    for (const skill of GAME_SKILLS) map.set(skill.id, [])
    for (const item of activations) {
      map.get(item.skillId)?.push(item.telegramId)
    }
    return map
  }, [activations])

  return { activations, bySkillId }
}
