import {
  Castle,
  CloudFog,
  Dices,
  Droplets,
  Flame,
  FlameKindling,
  HandCoins,
  LifeBuoy,
  Mountain,
  ShieldHalf,
  Tornado,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react"

import type { SkillId } from "@/api/reports"

const gameSkillIcons: Record<SkillId, LucideIcon> = {
  BOOST: Zap,
  SHIELD: ShieldHalf,
  THIEF: HandCoins,
  GAMBIT: Dices,
  TIDE: Waves,
  FOG: CloudFog,
  ELEM_FIRE: FlameKindling,
  ELEM_WATER: LifeBuoy,
  ELEM_AIR: Tornado,
  ELEM_EARTH: Castle,
  ULT_FIRE: Flame,
  ULT_WATER: Droplets,
  ULT_EARTH: Mountain,
  ULT_AIR: Wind,
}

export function GameSkillIcon({ skillId, className }: { skillId: SkillId; className?: string }) {
  const Icon = gameSkillIcons[skillId]
  return <Icon className={className} aria-hidden />
}
