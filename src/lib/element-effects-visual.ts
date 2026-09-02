import { EUserElement } from "@/enum/element"
import type { IElementEffect } from "@/interface/element-effect"
import { GAME_AVATAR_CARD, GAME_AVATAR_ICON_SRC, GAME_ELEMENT_CARDS } from "@/lib/game-elements-catalog"

export type ElementEffectTone = "bonus" | "penalty" | "neutral"

export type ElementEffectVisual = {
  accentColor: string
  iconSrc: string | null
  tone: ElementEffectTone
}

const ELEMENT_ACCENT: Record<EUserElement, string> = {
  [EUserElement.FIRE]: "#FF0000",
  [EUserElement.WATER]: "#06B6D4",
  [EUserElement.EARTH]: "#1C8C47",
  [EUserElement.AIR]: "#76E3D6",
}

const GENERIC_VISUALS: Record<string, ElementEffectVisual> = {
  streak_bonus: { accentColor: "#c4b5fd", iconSrc: null, tone: "bonus" },
  lucky_bonus: { accentColor: "#fbbf24", iconSrc: null, tone: "bonus" },
  top_three: { accentColor: "#34d399", iconSrc: null, tone: "bonus" },
  q_top_three: { accentColor: "#34d399", iconSrc: null, tone: "bonus" },
  bottom_three: { accentColor: "#fb7185", iconSrc: null, tone: "bonus" },
  q_bottom_three: { accentColor: "#fb7185", iconSrc: null, tone: "bonus" },
  q_bottom_two_by_score_plus: { accentColor: "#f472b6", iconSrc: null, tone: "bonus" },
  q_reverse_scoring: { accentColor: "#fb923c", iconSrc: null, tone: "bonus" },
  q_progressive_bonus: { accentColor: "#34d399", iconSrc: null, tone: "bonus" },
  q_sequential_order_bonus: { accentColor: "#f87171", iconSrc: null, tone: "bonus" },
  lucky_plus: { accentColor: "#fde047", iconSrc: null, tone: "bonus" },
  skill_boost: { accentColor: "#f59e0b", iconSrc: null, tone: "bonus" },
  skill_shield: { accentColor: "#38bdf8", iconSrc: null, tone: "neutral" },
  skill_shield_bonus: { accentColor: "#38bdf8", iconSrc: null, tone: "bonus" },
  skill_thief_gain: { accentColor: "#a3e635", iconSrc: null, tone: "bonus" },
  skill_thief_loss: { accentColor: "#f87171", iconSrc: null, tone: "penalty" },
  skill_thief_blocked: { accentColor: "#38bdf8", iconSrc: null, tone: "neutral" },
  skill_thief_empty: { accentColor: "#94a3b8", iconSrc: null, tone: "neutral" },
  skill_gambit: { accentColor: "#c084fc", iconSrc: null, tone: "neutral" },
  skill_tide: { accentColor: "#22d3ee", iconSrc: null, tone: "bonus" },
  skill_fog: { accentColor: "#f87171", iconSrc: null, tone: "penalty" },
  skill_fog_cast: { accentColor: "#94a3b8", iconSrc: null, tone: "neutral" },
}

const effectVisualById = new Map<string, ElementEffectVisual>()

for (const card of GAME_ELEMENT_CARDS) {
  const penaltyIds = new Set(card.penalties.map((item) => item.id))
  for (const effect of [...card.bonuses, ...card.penalties]) {
    effectVisualById.set(effect.id, {
      accentColor: card.accentColor,
      iconSrc: card.iconSrc,
      tone: penaltyIds.has(effect.id) ? "penalty" : "bonus",
    })
  }
}

for (const effect of [...GAME_AVATAR_CARD.bonuses, ...GAME_AVATAR_CARD.penalties]) {
  const penaltyIds = new Set(GAME_AVATAR_CARD.penalties.map((item) => item.id))
  effectVisualById.set(effect.id, {
    accentColor: "#FFFFFF",
    iconSrc: GAME_AVATAR_ICON_SRC,
    tone: penaltyIds.has(effect.id) ? "penalty" : "bonus",
  })
}

function toneFromPoints(points: number): ElementEffectTone {
  if (points < 0) return "penalty"
  if (points > 0) return "bonus"
  return "neutral"
}

function visualFromIdPrefix(id: string): ElementEffectVisual | null {
  const prefix = id.split("_")[0]?.toUpperCase()
  if (prefix === "FIRE") return { accentColor: ELEMENT_ACCENT[EUserElement.FIRE], iconSrc: "/element/fire.svg", tone: "bonus" }
  if (prefix === "WATER") return { accentColor: ELEMENT_ACCENT[EUserElement.WATER], iconSrc: "/element/water.svg", tone: "bonus" }
  if (prefix === "EARTH") return { accentColor: ELEMENT_ACCENT[EUserElement.EARTH], iconSrc: "/element/earth.svg", tone: "bonus" }
  if (prefix === "AIR") return { accentColor: ELEMENT_ACCENT[EUserElement.AIR], iconSrc: "/element/air.svg", tone: "bonus" }
  if (prefix === "AVATAR") return { accentColor: "#FFFFFF", iconSrc: GAME_AVATAR_ICON_SRC, tone: "bonus" }
  return null
}

export function getElementEffectVisual(effect: Pick<IElementEffect, "id" | "points">): ElementEffectVisual {
  const known = effectVisualById.get(effect.id) ?? GENERIC_VISUALS[effect.id]
  if (known) {
    return known.tone === "neutral" ? known : { ...known, tone: toneFromPoints(effect.points) }
  }

  const prefixed = visualFromIdPrefix(effect.id)
  if (prefixed) {
    return { ...prefixed, tone: toneFromPoints(effect.points) }
  }

  return {
    accentColor: toneFromPoints(effect.points) === "penalty" ? "#f87171" : "#94a3b8",
    iconSrc: null,
    tone: toneFromPoints(effect.points),
  }
}

export function formatElementEffectPoints(points: number): string {
  if (points === 0) return "0"
  if (points > 0) return `+${points}`
  return String(points)
}
