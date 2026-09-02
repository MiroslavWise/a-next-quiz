"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"

import Input from "@/components/ui/input"
import Button from "@/components/ui/button"
import Textarea from "@/components/ui/textarea"
import { OptionalImageUploadField } from "./OptionalImageUploadField"
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field"

import { getQuizes, postQuiz } from "@/api/quizes"
import { postUploadFileQuiz } from "@/api/upload-file"
import { resolverCreateQuizFormData, type CreateQuizFormData } from "@/schemas/create-quiz"

function CreateQuiz() {
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const router = useRouter()

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<CreateQuizFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
    resolver: resolverCreateQuizFormData,
  })

  const { refetch } = useQuery({
    queryKey: ["quizes"],
    queryFn: getQuizes,
    enabled: false,
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await postQuiz(data)
      if (res?.id) {
        if (coverFile) {
          try {
            await postUploadFileQuiz(coverFile, res.id)
          } catch (uploadError) {
            console.error(uploadError)
          }
        }
        void refetch().catch(() => {})
        router.replace(`/admin/quiz/${res.id}`)
      } else {
        console.error("Ошибка при создании квиза: нет id в ответе")
        router.replace(`/admin`)
      }
    } catch (error) {
      console.error(error)
    }
  })

  const handleReset = () => {
    reset({
      name: "",
      description: "",
    })
    setCoverFile(null)
  }

  return (
    <form onSubmit={onSubmit} onReset={handleReset} className="flex h-full w-full flex-col gap-4 py-6">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight">Создание квиза</h3>
        <p className="text-muted-foreground text-xs">Укажите название и описание квиза. Вы сможете добавить вопросы на следующем шаге.</p>
      </div>
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
        <OptionalImageUploadField
          value={coverFile}
          onChange={setCoverFile}
          label={
            <>
              Обложка квиза <span className="text-muted-foreground font-normal">(необязательно)</span>
            </>
          }
        />
      </div>
      <footer className="border-border -mx-4 flex w-[calc(100%+2rem)] items-center justify-end gap-2 border-t p-4">
        <Button type="reset" variant="outline" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-1">
              <span className="border-border size-3 animate-spin rounded-full border-2 border-t-transparent" />
              <span>Отмена…</span>
            </span>
          ) : (
            "Сбросить"
          )}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-1">
              <span className="border-border size-3 animate-spin rounded-full border-2 border-t-transparent" />
              <span>Сохраняем…</span>
            </span>
          ) : (
            "Сохранить квиз"
          )}
        </Button>
      </footer>
    </form>
  )
}

CreateQuiz.displayName = "CreateQuiz"
export default CreateQuiz
