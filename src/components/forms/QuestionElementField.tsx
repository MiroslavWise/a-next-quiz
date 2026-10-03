import Image from "next/image"

import { Field, FieldDescription, FieldLabel } from "../ui/field"
import { Toggle } from "../ui/toggle"

import { cn } from "@/lib/utils"
import { EUserElement } from "@/enum/element"
import { questionElementVisual } from "@/lib/question-element"

const ELEMENT_ORDER = [EUserElement.FIRE, EUserElement.WATER, EUserElement.EARTH, EUserElement.AIR] as const

type Props = {
  value: EUserElement | null | undefined
  onChange: (value: EUserElement | null) => void
  invalid?: boolean
}

function QuestionElementField({ value, onChange, invalid }: Props) {
  return (
    <Field data-invalid={invalid}>
      <FieldLabel>Стихия вопроса</FieldLabel>
      <FieldDescription>
        Верный ответ этой стихии: +7% base. Аватар бонус не получает. Туман, пепел и «первый теряет стихию» гасят и эту строку.
      </FieldDescription>
      <div role="radiogroup" aria-label="Стихия вопроса" className="flex flex-wrap gap-1.5">
        <Toggle
          type="button"
          variant="outline"
          pressed={value == null}
          aria-label="Без стихии"
          className={cn(
            "h-8 rounded-full px-3 text-xs",
            value == null && "border-foreground/35 bg-muted text-foreground",
          )}
          onPressedChange={(pressed) => {
            if (pressed) onChange(null)
          }}
        >
          Нет
        </Toggle>
        {ELEMENT_ORDER.map((id) => {
          const visual = questionElementVisual(id)
          if (!visual) return null
          const isActive = value === id

          return (
            <Toggle
              key={id}
              type="button"
              variant="outline"
              pressed={isActive}
              aria-label={visual.label}
              title={visual.label}
              className="h-8 rounded-full px-2.5 text-xs"
              style={
                isActive
                  ? {
                      borderColor: visual.accentColor,
                      backgroundColor: `color-mix(in srgb, ${visual.accentColor} 16%, transparent)`,
                      color: visual.accentColor,
                    }
                  : undefined
              }
              onPressedChange={(pressed) => {
                if (pressed) onChange(id)
              }}
            >
              <Image src={visual.iconSrc} alt="" width={14} height={14} className="size-3.5 object-contain" />
              {visual.label}
            </Toggle>
          )
        })}
      </div>
    </Field>
  )
}

QuestionElementField.displayName = "QuestionElementField"
export default QuestionElementField
