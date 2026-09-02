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
import { QuestionBonusesField } from "./QuestionBonusesField"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"

import {
  resolverCreateQuestionFormDataWithAnswers,
  type CreateQuestionFormData,
  type CreateQuestionFormDataWithAnswers,
  type IBodyCreateAnswer,
} from "@/schemas/create-question"
import { getColor } from "./lib/colors"
import { arrayTime, Time } from "@/enum/time"
import { postCreateAnswers } from "@/api/answers"
import { arrayPoints, Points } from "@/enum/points"
import { postCreateQuestion } from "@/api/questions"
import { postUploadFileQuestion } from "@/api/upload-file"
import { questionBonusesToApi } from "@/enum/question-bonus"

function CreateQuestion({ quizId }: { quizId: string }) {
  const router = useRouter()
  const [questionImage, setQuestionImage] = useState<File | null>(null)

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
      bonuses: [],
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
    try {
      const body: CreateQuestionFormData = {
        title: data.title,
        quizId: quizId,
        time: data.time,
        points: data.points,
        bonuses: questionBonusesToApi(data.bonuses),
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
          }
        }
      }

      router.push(`/admin/quiz/${quizId}`)
    } catch (error) {
      console.error(error)
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4 py-3">
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name} className="w-full items-center">
              Вопрос{" "}
              <div className="ml-auto flex flex-row items-center gap-2">
                <Controller
                  control={control}
                  name="time"
                  render={({ field: f_time, fieldState: f_timeState }) => (
                    <Select
                      onValueChange={(value) => {
                        f_time.onChange(Number(value))
                      }}
                      value={f_time.value?.toString() ?? "30"}
                    >
                      <SelectTrigger className="ml-auto w-full max-w-40" aria-invalid={f_timeState.invalid}>
                        <SelectValue placeholder="Выберите время" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectGroup>
                          <SelectLabel>Время</SelectLabel>
                          {arrayTime.map(([key, value]) => (
                            <SelectItem key={`::${key.toString()}::`} value={key.toString()}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  control={control}
                  name="points"
                  render={({ field: f_points, fieldState: f_pointsState }) => (
                    <Select
                      onValueChange={(value) => {
                        f_points.onChange(Number(value))
                      }}
                      value={f_points.value?.toString() ?? "1000"}
                    >
                      <SelectTrigger className="ml-auto w-full max-w-40" aria-invalid={f_pointsState.invalid}>
                        <SelectValue placeholder="Выберите количество очков" />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectGroup>
                          <SelectLabel>Количество очков</SelectLabel>
                          {arrayPoints.map(([key, value]) => (
                            <SelectItem key={`::${key.toString()}::`} value={key.toString()}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </FieldLabel>
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
      <Controller
        control={control}
        name="bonuses"
        render={({ field, fieldState }) => (
          <QuestionBonusesField value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
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
      <footer className="border-border -mx-4 w-[calc(100%+2rem)] border-t p-4">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
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
