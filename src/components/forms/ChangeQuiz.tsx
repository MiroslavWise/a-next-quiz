"use client"

import { Save } from "lucide-react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"

import Input from "@/components/ui/input"
import Button from "@/components/ui/button"
import Textarea from "@/components/ui/textarea"
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field"
import { ChangeQuestionIllustrationSection } from "./change-question/ChangeQuestionIllustrationSection"

import { patchQuiz } from "@/api/quizes"
import { deleteUploadImageQuiz, postUploadFileQuiz } from "@/api/upload-file"
import type { IQuiz } from "@/interface/quiz"
import { IMAGE_UPLOAD_MAX_BYTES, isAllowedImageUpload } from "./lib/optional-image-upload"
import { resolverCreateQuizFormData, type CreateQuizFormData } from "@/schemas/create-quiz"

function ChangeQuiz({ quiz }: { quiz: IQuiz }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const initialImageUrl = quiz.imageUrl ?? quiz.image_url ?? null

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<CreateQuizFormData>({
    defaultValues: {
      name: quiz.name ?? "",
      description: quiz.description ?? "",
    },
    resolver: resolverCreateQuizFormData,
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
    setSubmitError(null)
    try {
      const body: Partial<CreateQuizFormData> = {}
      if (data.name !== (quiz.name ?? "")) body.name = data.name
      if (data.description !== (quiz.description ?? "")) body.description = data.description

      if (Object.keys(body).length > 0) {
        await patchQuiz(quiz.id, body)
      }

      let imageFailed = false
      if (imageFile) {
        try {
          await postUploadFileQuiz(imageFile, quiz.id)
        } catch (uploadError) {
          imageFailed = true
          console.error(uploadError)
        }
      } else if (removeImage && initialImageUrl) {
        try {
          await deleteUploadImageQuiz(quiz.id)
        } catch (deleteError) {
          imageFailed = true
          console.error(deleteError)
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["quiz", quiz.id] }),
        queryClient.invalidateQueries({ queryKey: ["quizes"] }),
      ])

      if (imageFailed) {
        setSubmitError("Текст сохранён, обложку обновить не удалось.")
        return
      }

      router.push(`/admin/quiz/${quiz.id}`)
    } catch (error) {
      console.error(error)
      setSubmitError("Не удалось сохранить квиз.")
    }
  })

  const showUploader = !initialImageUrl || removeImage || !!imageFile
  const showCurrentServerImage = !!initialImageUrl && !imageFile && !removeImage

  return (
    <form onSubmit={onSubmit} className="flex h-full w-full flex-col gap-4 py-3">
      <div className="space-y-4">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-1.5">
              <FieldLabel htmlFor={field.name} className="text-foreground text-xs font-medium">
                Название квиза
              </FieldLabel>
              <Input id={field.name} {...field} placeholder="Например, «Тест по истории XX века»" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-1.5">
              <FieldLabel htmlFor={field.name} className="text-foreground text-xs font-medium">
                Описание квиза
              </FieldLabel>
              <Textarea
                id={field.name}
                {...field}
                placeholder="Кратко опишите, для кого этот квиз и о чём он."
                rows={4}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>До 200 символов.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
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
          label={
            <>
              Обложка квиза <span className="text-muted-foreground font-normal">(необязательно)</span>
            </>
          }
          uploadAriaLabel="Загрузить или заменить обложку квиза"
          removePendingMessage="Текущая обложка будет удалена после сохранения."
          replaceHint="Новый файл заменит текущую обложку после сохранения. "
          emptyDescription="Можно добавить обложку для списка квизов и лобби."
        />
      </div>
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

ChangeQuiz.displayName = "ChangeQuiz"
export default ChangeQuiz
