import { EUserElement } from "@/enum/element"

/** Четыре orb-цвета ответов / акцентов UI. */
export type ElementOrbColors = readonly [string, string, string, string]

export type ElementThemeId = "none" | EUserElement | "AVATAR"

export type ElementTheme = {
  id: ElementThemeId
  label: string
  /** Ключевое слово стихии из токенов QAND. */
  keyword: string
  /** Основной акцент UI и `--accent-orb`. */
  accent: string
  /** Светлый блик / glow. */
  highlight: string
  /** Тёмная подложка стекла. */
  surface: string
  /** Глубокий тон панели. */
  deep: string
  orbs: ElementOrbColors
}

/** Семантические темы по стихии — токены QAND. `--orb-bg-*` и `--orb-border-*` совпадают. */
export const ELEMENT_THEMES: Record<ElementThemeId, ElementTheme> = {
  none: {
    id: "none",
    label: "Без стихии",
    keyword: "Нейтраль",
    accent: "#B8C4D0",
    highlight: "#E2E8F0",
    surface: "#121418",
    deep: "#2a3038",
    orbs: ["#8B9AAB", "#A3AEC0", "#C2CAD6", "#6E7D8F"],
  },
  [EUserElement.FIRE]: {
    id: EUserElement.FIRE,
    label: "Огонь",
    keyword: "Жар",
    accent: "#E85D2A",
    highlight: "#FF8A4C",
    surface: "#1a0c0a",
    deep: "#3d1510",
    orbs: ["#E85D2A", "#FF8A4C", "#FF7040", "#C94A1F"],
  },
  [EUserElement.WATER]: {
    id: EUserElement.WATER,
    label: "Вода",
    keyword: "Течение",
    accent: "#06B6D4",
    highlight: "#67E8F9",
    surface: "#06141a",
    deep: "#0e3a44",
    orbs: ["#06B6D4", "#67E8F9", "#22D3EE", "#0891B2"],
  },
  [EUserElement.EARTH]: {
    id: EUserElement.EARTH,
    label: "Земля",
    keyword: "Корни",
    accent: "#1C8C47",
    highlight: "#4ADE80",
    surface: "#0b1610",
    deep: "#143322",
    orbs: ["#1C8C47", "#4ADE80", "#22C55E", "#15803D"],
  },
  [EUserElement.AIR]: {
    id: EUserElement.AIR,
    label: "Воздух",
    keyword: "Порыв",
    accent: "#76E3D6",
    highlight: "#C8FFF4",
    surface: "#0c1616",
    deep: "#1a3330",
    orbs: ["#76E3D6", "#C8FFF4", "#5EEAD4", "#2DD4BF"],
  },
  AVATAR: {
    id: "AVATAR",
    label: "Аватар",
    keyword: "Проводник",
    accent: "#F5F5F5",
    highlight: "#FFFFFF",
    surface: "#121214",
    deep: "#2a2a2e",
    orbs: ["#F5F5F5", "#FFFFFF", "#EDE4F5", "#C9C9D1"],
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
