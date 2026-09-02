import { Sparkles } from "lucide-react"

import { Field, FieldDescription, FieldLabel } from "../ui/field"
import { Toggle } from "../ui/toggle"

import { cn } from "@/lib/utils"
import {
  QUESTION_BONUS_OPTIONS,
  QuestionBonus,
  isNegativeQuestionBonus,
  normalizeQuestionBonuses,
} from "@/enum/question-bonus"
import { QuestionBonusIcon } from "@/lib/question-bonus-icons"

type Props = {
  value: QuestionBonus[] | null | undefined
  onChange: (value: QuestionBonus[]) => void
  invalid?: boolean
}

function getBonusToggleClassName(bonus: QuestionBonus, isActive: boolean) {
  const isNegative = isNegativeQuestionBonus(bonus)

  return cn(
    "size-10 min-w-10 shrink-0 rounded-xl p-0 shadow-none transition-all duration-200",
    !isActive &&
      "grayscale border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-muted-foreground data-[state=on]:bg-muted/30",
    isActive &&
      "grayscale-0 ring-1 ring-offset-1 ring-offset-background",
    isActive &&
      isNegative &&
      "border-(--unfaithful)/50 bg-(--unfaithful)/14 text-red-600 hover:bg-(--unfaithful)/20 data-[state=on]:bg-(--unfaithful)/14 dark:text-unfaithful",
    isActive &&
      !isNegative &&
      "border-(--accent-orb)/50 bg-(--accent-orb)/14 text-amber-600 hover:bg-(--accent-orb)/20 data-[state=on]:bg-(--accent-orb)/14 dark:text-amber-200",
    isActive && isNegative && "ring-(--unfaithful)/35",
    isActive && !isNegative && "ring-(--accent-orb)/35",
  )
}

export function QuestionBonusesField({ value, onChange, invalid }: Props) {
  const selected = normalizeQuestionBonuses(value)

  function setBonusEnabled(bonus: QuestionBonus, enabled: boolean) {
    const isSelected = selected.includes(bonus)
    if (enabled && !isSelected) onChange([...selected, bonus])
    if (!enabled && isSelected) onChange(selected.filter((item) => item !== bonus))
  }

  return (
    <Field data-invalid={invalid}>
      <FieldLabel>Бонусы вопроса</FieldLabel>
      <FieldDescription>Необязательно. Можно выбрать несколько — они действуют только на этот вопрос.</FieldDescription>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-dashed px-3 py-3",
          invalid ? "border-destructive/50 bg-destructive/5" : "border-amber-500/40 bg-amber-500/5",
        )}
      >
        <div className="flex items-start gap-2 text-sm text-amber-950/80 dark:text-amber-50/90">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-500 dark:text-amber-200" aria-hidden />
          <p className="text-muted-foreground text-xs leading-relaxed">
            Дополнительные правила начисления очков и влияния стихий. Без выбора вопрос идёт по стандартным правилам квиза.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUESTION_BONUS_OPTIONS.map((option) => {
            const isActive = selected.includes(option.value)

            return (
              <Toggle
                key={option.value}
                variant="outline"
                pressed={isActive}
                aria-label={option.label}
                title={`${option.label}. ${option.detail}`}
                className={getBonusToggleClassName(option.value, isActive)}
                onPressedChange={(enabled) => setBonusEnabled(option.value, enabled)}
              >
                <QuestionBonusIcon bonus={option.value} className="size-4.5" />
              </Toggle>
            )
          })}
        </div>
        {selected.length > 0 ? (
          <p className="text-muted-foreground text-[0.68rem]">
            Выбрано: {selected.length} · {selected.map((bonus) => QUESTION_BONUS_OPTIONS.find((o) => o.value === bonus)?.label).join(", ")}
          </p>
        ) : (
          <p className="text-muted-foreground text-[0.68rem]">Наведите на иконку, чтобы увидеть описание бонуса.</p>
        )}
      </div>
    </Field>
  )
}
