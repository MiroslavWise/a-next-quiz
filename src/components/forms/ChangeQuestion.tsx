"use client"

import { Save } from "lucide-react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useFieldArray, useForm } from "react-hook-form"

import Button from "../ui/button"
import Textarea from "../ui/textarea"
import { Field, FieldError, FieldLabel } from "../ui/field"
import { deleteUploadImageQuestion, postUploadFileQuestion } from "@/api/upload-file"
import { ChangeQuestionAnswersSection } from "./change-question/ChangeQuestionAnswersSection"
import { ChangeQuestionIllustrationSection } from "./change-question/ChangeQuestionIllustrationSection"
import { QuestionBonusesField } from "./QuestionBonusesField"
import { IMAGE_UPLOAD_MAX_BYTES, isAllowedImageUpload } from "./lib/optional-image-upload"
import { Select, SelectItem, SelectLabel, SelectValue, SelectTrigger, SelectContent, SelectGroup } from "../ui/select"

import { getColor } from "./lib/colors"
import { arrayTime, Time } from "@/enum/time"
import type { IAnswer } from "@/interface/answer"
import { arrayPoints, Points } from "@/enum/points"
import { updateAnswers } from "./lib/update-answers"
import type { IQuestion } from "@/interface/question"
import { updateQuestion } from "./lib/update-question"
import { normalizeQuestionBonuses } from "@/enum/question-bonus"
import { resolverCreateQuestionFormDataWithAnswers, type CreateQuestionFormDataWithAnswers } from "@/schemas/create-question"

interface IProps {
  question: IQuestion
  answers: IAnswer[]
}

function ChangeQuestion({ question, answers }: IProps) {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const initialImageUrl = question.imageUrl ?? question.image_url ?? null

  const {
    handleSubmit,
    control,
    register,
    getValues,
    setValue,
    formState: { isSubmitting },
  } = useForm<CreateQuestionFormDataWithAnswers>({
    defaultValues: {
      title: question.title,
      quizId: question.quizId,
      time: question.time ?? Time.HIGH,
      points: question.points ?? Points.HIGH,
      bonuses: normalizeQuestionBonuses(question.bonuses),
      answers: [
        ...answers.map((answer) => ({
          id: answer.id,
          text: answer.description,
          isCorrect: answer.check,
        })),
        ...Array.from({ length: 4 - answers.length }).map(() => ({
          id: "",
          text: "",
          isCorrect: false,
        })),
      ],
    },
    resolver: resolverCreateQuestionFormDataWithAnswers,
  })

  const { fields } = useFieldArray({
    control,
    name: "answers",
  })

  const applyReplaceFile = (file: File | undefined) => {
    if (!file) return
    if (!isAllowedImageUpload(file)) {
      if (replaceInputRef.current) replaceInputRef.current.value = ""
      return
    }
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      if (replaceInputRef.current) replaceInputRef.current.value = ""
      return
    }
    setImageFile(file)
    setRemoveImage(false)
    if (replaceInputRef.current) replaceInputRef.current.value = ""
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await Promise.all([
        updateAnswers({ answers: answers || [], values: { answers: data.answers }, questionId: question.id }),
        updateQuestion({ question: question, data: data }),
      ])

      let imageFailed = false
      if (imageFile) {
        try {
          await postUploadFileQuestion(imageFile, question.id)
        } catch (uploadError) {
          imageFailed = true
          console.error(uploadError)
        }
      } else if (removeImage && initialImageUrl) {
        try {
          await deleteUploadImageQuestion(question.id)
        } catch (deleteError) {
          imageFailed = true
          console.error(deleteError)
        }
      }

      if (imageFailed) {
        console.warn("Изменения текста сохранены, но операция с иллюстрацией не удалась")
      }
    } catch (error) {
      console.error(error)
    } finally {
      router.push(`/admin/quiz/${question.quizId}`)
    }
  })

  const showUploader = !initialImageUrl || removeImage || !!imageFile
  const showCurrentServerImage = !!initialImageUrl && !imageFile && !removeImage

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
              placeholder="Например, «Как было ...?»"
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
      <ChangeQuestionIllustrationSection
        initialImageUrl={initialImageUrl}
        showCurrentServerImage={showCurrentServerImage}
        showUploader={showUploader}
        removeImage={removeImage}
        imageFile={imageFile}
        replaceInputRef={replaceInputRef}
        setRemoveImage={setRemoveImage}
        setImageFile={setImageFile}
        applyReplaceFile={applyReplaceFile}
      />
      <ChangeQuestionAnswersSection
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
              <span>Сохраняем изменения…</span>
            </span>
          ) : (
            <>
              Сохранить изменения <Save className="size-3.5" />
            </>
          )}
        </Button>
      </footer>
    </form>
  )
}

ChangeQuestion.displayName = "ChangeQuestion"
export default ChangeQuestion
