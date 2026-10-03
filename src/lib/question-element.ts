import { elementThemeById } from "@/constants/palette"
import { EUserElement } from "@/enum/element"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"

const QUESTION_ELEMENT_IDS = new Set<string>([EUserElement.FIRE, EUserElement.WATER, EUserElement.EARTH, EUserElement.AIR])

const QUESTION_ELEMENT_GENITIVE: Record<EUserElement, string> = {
  [EUserElement.FIRE]: "Огня",
  [EUserElement.WATER]: "Воды",
  [EUserElement.EARTH]: "Земли",
  [EUserElement.AIR]: "Воздуха",
}

export type QuestionElementVisual = {
  id: EUserElement
  iconSrc: string
  accentColor: string
  name: string
  label: string
}

/** Четыре стихии вопроса. Пусто, `AVATAR` и неизвестное — нет метки. */
export function questionElementId(value: unknown): EUserElement | null {
  if (typeof value !== "string") return null
  const id = value.trim().toUpperCase()
  if (!QUESTION_ELEMENT_IDS.has(id)) return null
  return id as EUserElement
}

export function questionElementVisual(value: unknown): QuestionElementVisual | null {
  const id = questionElementId(value)
  if (!id) return null
  return {
    id,
    ...GAME_ELEMENT_VISUAL_BY_ID[id],
    label: elementThemeById(id).label,
  }
}

export function questionElementHint(id: EUserElement) {
  return `Вопрос ${QUESTION_ELEMENT_GENITIVE[id]}. Верный ответ этой стихии: +7% base`
}
