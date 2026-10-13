"use client"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Toggle } from "@/components/ui/toggle"
import type { SkillVariant } from "@/api/reports"
import type { GameSkillVariantOption } from "@/enum/game-skill"
import { cn } from "@/lib/utils"

interface SkillVariantPickerProps {
  options: readonly GameSkillVariantOption[]
  value: SkillVariant | null
  onChange: (value: SkillVariant) => void
  disabled?: boolean
}

function SkillVariantPicker({ options, value, onChange, disabled }: SkillVariantPickerProps) {
  return (
    <Field>
      <FieldLabel>Путь эффекта</FieldLabel>
      <FieldDescription>Как способность сработает на следующем вопросе</FieldDescription>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const pressed = value === option.id
          return (
            <Toggle
              key={option.id}
              type="button"
              variant="outline"
              pressed={pressed}
              disabled={disabled}
              aria-label={`${option.title}: ${option.detail}`}
              title={`${option.title}: ${option.detail}`}
              onPressedChange={(next) => {
                if (next) onChange(option.id)
              }}
              className={cn(
                "h-auto min-h-16 flex-col items-start gap-1 rounded-xl border-white/15 bg-white/5 px-3 py-2.5 text-left whitespace-normal text-white/80 hover:bg-white/10 hover:text-white",
                pressed && "border-(--accent-orb)/70 bg-(--accent-orb)/15 text-white hover:bg-(--accent-orb)/20",
              )}
            >
              <span className="text-sm font-semibold">{option.title}</span>
              <span className="text-xs font-normal text-white/65">{option.detail}</span>
            </Toggle>
          )
        })}
      </div>
    </Field>
  )
}

export default SkillVariantPicker
