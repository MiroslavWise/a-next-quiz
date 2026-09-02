"use client"

import type {
  Control,
  FieldArrayWithId,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"

import { QuestionAnswersFields } from "../QuestionAnswersFields"

import type { CreateQuestionFormDataWithAnswers } from "@/schemas/create-question"

type Props = {
  control: Control<CreateQuestionFormDataWithAnswers>
  register: UseFormRegister<CreateQuestionFormDataWithAnswers>
  fields: FieldArrayWithId<CreateQuestionFormDataWithAnswers, "answers", "id">[]
  getValues: UseFormGetValues<CreateQuestionFormDataWithAnswers>
  setValue: UseFormSetValue<CreateQuestionFormDataWithAnswers>
  getColor: (index: number) => string
}

export function ChangeQuestionAnswersSection({ control, register, fields, getValues, setValue, getColor }: Props) {
  return (
    <QuestionAnswersFields
      control={control}
      register={register}
      fields={fields}
      getValues={getValues}
      setValue={setValue}
      getColor={getColor}
    />
  )
}
