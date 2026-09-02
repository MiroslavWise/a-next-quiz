import { PickaxeIcon as LucidePickaxeIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { pickaxeIconClass, type PickaxeIconTone } from "@/lib/quiz-points"

interface PickaxeIconProps {
  className?: string
  /** Если задано и &lt; 0 — алокрасная кирка (если не переопределён `tone`). */
  points?: number
  /** Явный тон: золото / штраф / серебро (нейтрально). */
  tone?: PickaxeIconTone
}

/** Иконка очков (кирка): золотая, алокрасная при минусе или серебряная (нейтрально). */
export default function PickaxeIcon({ className, points, tone }: PickaxeIconProps) {
  return <LucidePickaxeIcon className={cn(pickaxeIconClass({ points, tone }), className)} aria-hidden />
}
