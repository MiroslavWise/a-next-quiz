"use client"

import { useState } from "react"
import { FilePlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Controller, useFieldArray, useForm } from "react-hook-form"

import Button from "../ui/button"
import Textarea from "../ui/textarea"
import { Field, FieldError, FieldLabel } from "../ui/field"
import { OptionalImageUploadField } from "./OptionalImageUploadField"
import { QuestionAnswersFields } from "./QuestionAnswersFields"
import QuestionElementField from "./QuestionElementField"
import { QuestionBonusesField } from "./QuestionBonusesField"
import QuestionTimePointsFields from "./QuestionTimePointsFields"

import {
  resolverCreateQuestionFormDataWithAnswers,
  type CreateQuestionFormData,
  type CreateQuestionFormDataWithAnswers,
  type IBodyCreateAnswer,
} from "@/schemas/create-question"
import { getColor } from "./lib/colors"
import { Time } from "@/enum/time"
import { postCreateAnswers } from "@/api/answers"
import { Points } from "@/enum/points"
import { postCreateQuestion } from "@/api/questions"
import { postUploadFileQuestion } from "@/api/upload-file"
import { DEFAULT_CREATE_QUESTION_BONUSES, questionBonusesToApi } from "@/enum/question-bonus"

function CreateQuestion({ quizId }: { quizId: string }) {
  const router = useRouter()
  const [questionImage, setQuestionImage] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
    register,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = useForm<CreateQuestionFormDataWithAnswers>({
    defaultValues: {
      title: "",
      quizId: quizId,
      time: Time.HIGH,
      points: Points.HIGH,
      bonuses: [...DEFAULT_CREATE_QUESTION_BONUSES],
      element: null,
      answers: Array.from({ length: 4 }).map(() => ({
        id: "",
        text: "",
        isCorrect: false,
      })),
    },
    resolver: resolverCreateQuestionFormDataWithAnswers,
  })

  const { fields } = useFieldArray({
    control,
    name: "answers",
  })

  const onSubmit = handleSubmit(async (data) => {
    setSubmitError(null)
    try {
      const body: CreateQuestionFormData = {
        title: data.title,
        quizId: quizId,
        time: data.time,
        points: data.points,
        bonuses: questionBonusesToApi(data.bonuses),
        element: data.element ?? null,
      }

      const res = await postCreateQuestion(body)

      if (res?.id) {
        const bodyAnswers: IBodyCreateAnswer[] = data.answers.flatMap((answer) =>
          answer.text.trim() === "" ? [] : [{ description: answer.text.trim(), check: answer.isCorrect }],
        )

        await postCreateAnswers(bodyAnswers, res.id)

        if (questionImage) {
          try {
            await postUploadFileQuestion(questionImage, res.id)
          } catch (uploadError) {
            console.error(uploadError)
            setSubmitError("Вопрос сохранён, иллюстрацию загрузить не удалось.")
            return
          }
        }
        router.push(`/admin/quiz/${quizId}`)
        return
      }
      setSubmitError("Не удалось сохранить вопрос.")
    } catch (error) {
      console.error(error)
      setSubmitError("Не удалось сохранить вопрос.")
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4 py-3">
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Вопрос</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              placeholder="Например, «Что было ...?»"
              rows={6}
              className="min-h-24 resize-none"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <QuestionTimePointsFields control={control} />
      <Controller
        control={control}
        name="bonuses"
        render={({ field, fieldState }) => (
          <QuestionBonusesField value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
        )}
      />
      <Controller
        control={control}
        name="element"
        render={({ field, fieldState }) => (
          <QuestionElementField value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
        )}
      />
      <OptionalImageUploadField
        value={questionImage}
        onChange={setQuestionImage}
        label={
          <>
            Иллюстрация к вопросу <span className="text-muted-foreground font-normal">(необязательно)</span>
          </>
        }
      />
      <QuestionAnswersFields
        control={control}
        register={register}
        fields={fields}
        getValues={getValues}
        setValue={setValue}
        getColor={getColor}
      />
      <footer className="border-border -mx-4 flex w-[calc(100%+2rem)] flex-col items-end gap-2 border-t p-4">
        {submitError ? (
          <p role="alert" className="text-destructive w-full text-right text-xs">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-1">
              <span className="border-border size-3 animate-spin rounded-full border-2 border-t-transparent" />
              <span>Добавляем вопрос…</span>
            </span>
          ) : (
            <>
              Добавить вопрос <FilePlus className="size-3.5" />
            </>
          )}
        </Button>
      </footer>
    </form>
  )
}

CreateQuestion.displayName = "CreateQuestion"
export default CreateQuestion
