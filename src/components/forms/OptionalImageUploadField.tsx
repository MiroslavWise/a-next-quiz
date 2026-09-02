"use client"

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { ImagePlus, X } from "lucide-react"

import Button from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { IMAGE_UPLOAD_ACCEPT, IMAGE_UPLOAD_MAX_BYTES, formatImageUploadSize, isAllowedImageUpload } from "./lib/optional-image-upload"

type OptionalImageUploadFieldProps = {
  value: File | null
  onChange: (file: File | null) => void
  label: ReactNode
  /** Скрыть видимую подпись (остаётся только для скринридеров), если заголовок задан снаружи */
  hideLabel?: boolean
  /** Подпись под полем (по умолчанию — лимиты форматов и размера) */
  description?: ReactNode
  className?: string
}

export function OptionalImageUploadField({
  value,
  onChange,
  label,
  hideLabel = false,
  description = <>Необязательно: JPG, PNG, WebP или AVIF, до {IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024)} МБ, один файл.</>,
  className,
}: OptionalImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fieldId = useId()
  const [drag, setDrag] = useState(false)

  const previewUrl = useMemo(() => {
    if (!value || !isAllowedImageUpload(value)) return null
    return URL.createObjectURL(value)
  }, [value])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const applyFile = (file: File | undefined) => {
    if (!file) return
    if (!isAllowedImageUpload(file)) {
      if (inputRef.current) inputRef.current.value = ""
      return
    }
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      if (inputRef.current) inputRef.current.value = ""
      return
    }
    onChange(file)
  }

  const clear = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Field className={cn("space-y-1.5", className)}>
      <FieldLabel htmlFor={fieldId} className={hideLabel ? "sr-only" : "text-foreground text-xs font-medium"}>
        {label}
      </FieldLabel>
      <input
        id={fieldId}
        ref={inputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        className="sr-only"
        onChange={(e) => applyFile(e.target.files?.[0])}
      />
      {!value ? (
        <label
          htmlFor={fieldId}
          onDragEnter={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDrag(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDrag(false)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDrag(false)
            applyFile(e.dataTransfer.files?.[0])
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            drag ? "border-primary/60 bg-primary/5" : "border-border/80 bg-muted/20 hover:border-border hover:bg-muted/35",
          )}
        >
          <span className="border-border/60 bg-background/80 flex size-11 items-center justify-center rounded-full border">
            <ImagePlus className="text-muted-foreground size-5" aria-hidden />
          </span>
          <span className="text-foreground text-sm font-medium">Выбрать изображение</span>
          <span className="text-muted-foreground text-xs">По желанию. Перетащите файл сюда или нажмите, чтобы открыть проводник</span>
        </label>
      ) : (
        <div className="border-border/80 bg-muted/20 flex gap-3 rounded-xl border p-3">
          <div className="border-border/60 bg-background relative size-20 shrink-0 overflow-hidden rounded-lg border">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="text-muted-foreground flex size-full items-center justify-center">
                <ImagePlus className="size-8 opacity-50" aria-hidden />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="text-foreground truncate text-sm font-medium" title={value.name}>
              {value.name}
            </p>
            <p className="text-muted-foreground text-xs">{formatImageUploadSize(value.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 self-start rounded-lg"
            aria-label="Убрать файл"
            onClick={clear}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      <FieldDescription>{description}</FieldDescription>
    </Field>
  )
}
