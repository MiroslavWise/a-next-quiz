"use client"

import { useMemo } from "react"

import type { IElementEffect } from "@/interface/element-effect"
import type { IRank } from "@/api/rank"

/** Эффекты стихии из `GET /report/{id}/my-rank` для закрытого вопроса. */
export function useElementEffectsRank({
  activeIndex,
  data,
}: {
  activeIndex: number
  data: Pick<IRank, "element_effects" | "element_effects_index"> | undefined
}): IElementEffect[] | null {
  return useMemo(() => {
    if (!data?.element_effects?.length) {
      return null
    }

    const index = Number(data.element_effects_index ?? -1)
    if (index !== activeIndex) {
      return null
    }

    return data.element_effects
  }, [activeIndex, data?.element_effects, data?.element_effects_index])
}
