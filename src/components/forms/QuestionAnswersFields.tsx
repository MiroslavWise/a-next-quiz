"use client"

import {
  Controller,
  useFormState,
  type Control,
  type FieldArrayWithId,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form"

import { AnswerInputWithSwitch } from "./AnswerInputWithSwitch"
import { Field, FieldError, FieldLabel, FieldSet } from "../ui/field"

import type { CreateQuestionFormDataWithAnswers } from "@/schemas/create-question"

type Props = {
  control: Control<CreateQuestionFormDataWithAnswers>
  register: UseFormRegister<CreateQuestionFormDataWithAnswers>
  fields: FieldArrayWithId<CreateQuestionFormDataWithAnswers, "answers", "id">[]
  getValues: UseFormGetValues<CreateQuestionFormDataWithAnswers>
  setValue: UseFormSetValue<CreateQuestionFormDataWithAnswers>
  getColor: (index: number) => string
}

/**
 * Поля ответов: текст через `register` (меньше controlled-ререндеров на мобиле),
 * переключатель верного — через Controller.
 */
export function QuestionAnswersFields({ control, register, fields, getValues, setValue, getColor }: Props) {
  const { errors } = useFormState({ control, name: "answers" })
  const answersError = errors.answers
  const invalid = !!answersError

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor="answers">Ответы</FieldLabel>
      <FieldSet className="flex w-full flex-col gap-2">
        {fields.map((item, index) => (
          <Field key={item.id}>
            <Controller
              control={control}
              name={`answers.${index}.isCorrect`}
              render={({ field: correctField }) => (
                <AnswerInputWithSwitch
                  index={index}
                  switchId={item.id}
                  checked={correctField.value}
                  color={getColor(index)}
                  invalid={invalid}
                  inputProps={{
                    ...register(`answers.${index}.text`),
                    placeholder: "Например...",
                  }}
                  onCheckedChange={(value) => {
                    if (!value) {
                      setValue(`answers.${index}.isCorrect`, false, { shouldDirty: true, shouldValidate: true })
                      return
                    }

                    const answers = getValues("answers")
                    answers.forEach((_, i) => {
                      setValue(`answers.${i}.isCorrect`, i === index, { shouldDirty: true, shouldValidate: true })
                    })
                  }}
                />
              )}
            />
          </Field>
        ))}
      </FieldSet>
      {invalid ? (
        <FieldError
          errors={[
            (answersError as unknown as { root?: { message?: string } })?.root,
            answersError as { message?: string } | undefined,
          ]}
        />
      ) : null}
    </Field>
  )
}
