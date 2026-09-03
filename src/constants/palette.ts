import { EUserElement } from "@/enum/element"

/** Четыре orb-цвета ответов / акцентов UI. */
export type ElementOrbColors = readonly [string, string, string, string]

export type ElementThemeId = "none" | EUserElement | "AVATAR"

export type ElementTheme = {
  id: ElementThemeId
  label: string
  accent: string
  orbs: ElementOrbColors
}

/** Семантические темы по стихии — насыщенные, игровые. `--orb-bg-*` и `--orb-border-*` совпадают. */
export const ELEMENT_THEMES: Record<ElementThemeId, ElementTheme> = {
  none: {
    id: "none",
    label: "Без стихии",
    accent: "#B8C4D0",
    orbs: ["#8B9AAB", "#A3AEC0", "#C2CAD6", "#6E7D8F"],
  },
  [EUserElement.FIRE]: {
    id: EUserElement.FIRE,
    label: "Огонь",
    accent: "#FF8A00",
    orbs: ["#FF4040", "#FF8A00", "#FFD60A", "#E53935"],
  },
  [EUserElement.WATER]: {
    id: EUserElement.WATER,
    label: "Вода",
    accent: "#06B6D4",
    orbs: ["#06B6D4", "#0EA5E9", "#22D3EE", "#0891B2"],
  },
  [EUserElement.EARTH]: {
    id: EUserElement.EARTH,
    label: "Земля",
    accent: "#22C55E",
    orbs: ["#1C8C47", "#10B981", "#84CC16", "#15803D"],
  },
  [EUserElement.AIR]: {
    id: EUserElement.AIR,
    label: "Воздух",
    accent: "#76E3D6",
    orbs: ["#76E3D6", "#38BDF8", "#A78BFA", "#2DD4BF"],
  },
  AVATAR: {
    id: "AVATAR",
    label: "Аватар игры",
    /** Белый акцент — стеклянные плашки; orb — четыре цвета стихий. */
    accent: "#FFFFFF",
    orbs: ["#FF0000", "#06B6D4", "#1C8C47", "#76E3D6"],
  },
}

export function elementThemeById(id: ElementThemeId): ElementTheme {
  return ELEMENT_THEMES[id]
}

export function resolveElementThemeId(element: EUserElement | null | undefined, isGameAvatar: boolean): ElementThemeId {
  if (isGameAvatar) return "AVATAR"
  if (!element) return "none"
  return element
}
