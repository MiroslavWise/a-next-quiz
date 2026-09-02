"use client"

import { useMemo } from "react"

import type { ISkillEffect } from "@/api/reports"
import type { IRank } from "@/api/rank"

/** Эффекты способностей из `GET /report/{id}/my-rank` для закрытого вопроса. */
export function useSkillEffectsRank({
  activeIndex,
  data,
}: {
  activeIndex: number
  data: Pick<IRank, "skill_effects" | "element_effects_index"> | undefined
}): ISkillEffect[] | null {
  return useMemo(() => {
    if (!data?.skill_effects?.length) {
      return null
    }

    const index = Number(data.element_effects_index ?? -1)
    if (index !== activeIndex) {
      return null
    }

    return data.skill_effects
  }, [activeIndex, data?.skill_effects, data?.element_effects_index])
}
