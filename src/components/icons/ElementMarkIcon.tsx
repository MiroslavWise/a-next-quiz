import { Droplets, Flame, Mountain, Sparkles, Wind, type LucideIcon } from "lucide-react"

import { EUserElement } from "@/enum/element"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"

const ELEMENT_ICONS: Record<EUserElement, LucideIcon> = {
  [EUserElement.FIRE]: Flame,
  [EUserElement.WATER]: Droplets,
  [EUserElement.EARTH]: Mountain,
  [EUserElement.AIR]: Wind,
}

interface ElementMarkIconProps {
  element?: EUserElement | null
  className?: string
}

/** Стихия профиля или искра, если стихия ещё не выбрана. */
export default function ElementMarkIcon({ element, className }: ElementMarkIconProps) {
  if (element == null || ELEMENT_ICONS[element] == null) {
    return <Sparkles className={className} aria-hidden />
  }

  const Icon = ELEMENT_ICONS[element]
  return <Icon className={className} style={{ color: GAME_ELEMENT_VISUAL_BY_ID[element].accentColor }} aria-hidden />
}
