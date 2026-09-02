import type { EUserElement } from "@/enum/element"
import { elementThemeById } from "@/constants/palette"

export function getElementThemeUpdatedToastMessage(element: EUserElement): string {
  return `Схема обновлена под ${elementThemeById(element).label}`
}
