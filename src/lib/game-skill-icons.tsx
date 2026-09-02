import { CloudFog, Dices, HandCoins, ShieldHalf, Waves, Zap, type LucideIcon } from "lucide-react"

import type { SkillId } from "@/api/reports"

const gameSkillIcons: Record<SkillId, LucideIcon> = {
  BOOST: Zap,
  SHIELD: ShieldHalf,
  THIEF: HandCoins,
  GAMBIT: Dices,
  TIDE: Waves,
  FOG: CloudFog,
}

export function GameSkillIcon({ skillId, className }: { skillId: SkillId; className?: string }) {
  const Icon = gameSkillIcons[skillId]
  return <Icon className={className} aria-hidden />
}
