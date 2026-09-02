import type { RefObject } from "react"

import Button from "../../ui/button"
import { Field, FieldDescription, FieldLabel } from "../../ui/field"
import { OptionalImageUploadField } from "../OptionalImageUploadField"

import { IMAGE_UPLOAD_ACCEPT } from "../lib/optional-image-upload"

type Props = {
  initialImageUrl: string | null
  showCurrentServerImage: boolean
  showUploader: boolean
  removeImage: boolean
  imageFile: File | null
  replaceInputRef: RefObject<HTMLInputElement | null>
  setRemoveImage: (v: boolean) => void
  setImageFile: (f: File | null) => void
  applyReplaceFile: (file: File | undefined) => void
}

export function ChangeQuestionIllustrationSection({
  initialImageUrl,
  showCurrentServerImage,
  showUploader,
  removeImage,
  imageFile,
  replaceInputRef,
  setRemoveImage,
  setImageFile,
  applyReplaceFile,
}: Props) {
  return (
    <Field className="space-y-3">
      <FieldLabel className="text-foreground text-sm font-medium">
        Иллюстрация к вопросу <span className="text-muted-foreground font-normal">(необязательно)</span>
      </FieldLabel>
      {showCurrentServerImage ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="border-border/80 bg-muted/20 size-24 shrink-0 overflow-hidden rounded-xl border">
            <img src={initialImageUrl!} alt="" className="size-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => replaceInputRef.current?.click()}>
              Заменить
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setRemoveImage(true)
                setImageFile(null)
              }}
            >
              Удалить
            </Button>
          </div>
          <input
            ref={replaceInputRef}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            className="sr-only"
            onChange={(e) => applyReplaceFile(e.target.files?.[0])}
          />
        </div>
      ) : null}
      {initialImageUrl && removeImage && !imageFile ? (
        <div className="text-foreground rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2.5 text-sm">
          <p className="text-muted-foreground">Текущая иллюстрация будет удалена после сохранения.</p>
          <Button type="button" variant="link" className="text-foreground h-auto px-0 pt-1" onClick={() => setRemoveImage(false)}>
            Отменить удаление
          </Button>
        </div>
      ) : null}
      {showUploader ? (
        <OptionalImageUploadField
          hideLabel
          label="Загрузить или заменить изображение к вопросу"
          value={imageFile}
          onChange={(f) => {
            setImageFile(f)
            if (f) setRemoveImage(false)
          }}
          description={
            <>
              {initialImageUrl && !removeImage ? "Новый файл заменит текущую иллюстрацию после сохранения. " : null}
              JPG, PNG, WebP или AVIF, до 2 МБ.
            </>
          }
        />
      ) : null}
      {!initialImageUrl ? <FieldDescription>Можно добавить одну картинку к формулировке вопроса.</FieldDescription> : null}
    </Field>
  )
}
