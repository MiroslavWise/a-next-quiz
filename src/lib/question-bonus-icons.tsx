import type { LucideIcon } from "lucide-react"
import {
  ArrowLeftRight,
  ArrowDownUp,
  Crown,
  Dices,
  HeartHandshake,
  Orbit,
  Pointer,
  PowerOff,
  Snail,
  TrendingUp,
} from "lucide-react"

import { QuestionBonus, type QuestionBonusValue } from "@/enum/question-bonus"

const QUESTION_BONUS_ICONS: Record<QuestionBonus, LucideIcon> = {
  [QuestionBonus.TOP_THREE]: Crown,
  [QuestionBonus.BOTTOM_THREE]: Snail,
  [QuestionBonus.BOTTOM_TWO_BY_SCORE_PLUS]: HeartHandshake,
  [QuestionBonus.LUCKY_PLUS]: Dices,
  [QuestionBonus.FIRST_ANSWERER_LOSE_ELEMENT]: Pointer,
  [QuestionBonus.WRONG_ANSWER_DISABLE_ELEMENT]: PowerOff,
  [QuestionBonus.REVERSE_SCORING]: ArrowLeftRight,
  [QuestionBonus.ALL_ELEMENTS_BOOST]: Orbit,
  [QuestionBonus.PROGRESSIVE_BONUS]: TrendingUp,
  [QuestionBonus.SEQUENTIAL_ORDER_BONUS]: ArrowDownUp,
}

export function getQuestionBonusIcon(bonus: QuestionBonus | QuestionBonusValue): LucideIcon {
  return QUESTION_BONUS_ICONS[bonus as QuestionBonus]
}

type QuestionBonusIconProps = {
  bonus: QuestionBonus | QuestionBonusValue
  className?: string
}

export function QuestionBonusIcon({ bonus, className }: QuestionBonusIconProps) {
  const Icon = getQuestionBonusIcon(bonus)
  return <Icon className={className} aria-hidden />
}
