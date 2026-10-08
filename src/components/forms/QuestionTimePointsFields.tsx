"use client"

import { Controller, type Control } from "react-hook-form"

import { Field, FieldLabel } from "../ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"

import { arrayTime } from "@/enum/time"
import { arrayPoints } from "@/enum/points"
import type { CreateQuestionFormDataWithAnswers } from "@/schemas/create-question"

function QuestionTimePointsFields({ control }: { control: Control<CreateQuestionFormDataWithAnswers> }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Controller
        control={control}
        name="time"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1.5">
            <FieldLabel className="text-xs">Время</FieldLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() ?? "30"}>
              <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Выберите время" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Время</SelectLabel>
                  {arrayTime.map(([key, value]) => (
                    <SelectItem key={`time-${key.toString()}`} value={key.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}
      />
      <Controller
        control={control}
        name="points"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-1.5">
            <FieldLabel className="text-xs">Очки</FieldLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() ?? "1000"}>
              <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Выберите количество очков" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Количество очков</SelectLabel>
                  {arrayPoints.map(([key, value]) => (
                    <SelectItem key={`points-${key.toString()}`} value={key.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}
      />
    </div>
  )
}

QuestionTimePointsFields.displayName = "QuestionTimePointsFields"
export default QuestionTimePointsFields
