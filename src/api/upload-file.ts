import getApiHeaders from "./api-headers"
import { api } from "./instance"

const UPLOAD_ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])

function mimeFromFileName(name: string): string | null {
  const ext = name.match(/\.([^.]+)$/i)?.[1]?.toLowerCase()
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg"
  if (ext === "png") return "image/png"
  if (ext === "webp") return "image/webp"
  if (ext === "avif") return "image/avif"
  return null
}

function resolveMimeForUpload(file: File): string {
  const t = file.type?.toLowerCase() ?? ""
  if (t && t !== "application/octet-stream" && UPLOAD_ALLOWED_IMAGE_TYPES.has(t)) {
    return t
  }
  return mimeFromFileName(file.name) ?? "image/jpeg"
}

/**
 * Имя с расширением (.jpg / .png / …): бэкенд использует его при `octet-stream`, плюс sniffing по байтам.
 * См. `docs/API.md` — не полагаться на имя `blob` без суффикса.
 */
function ensureUploadFileName(file: File): File {
  if (/\.(jpe?g|png|webp|avif)$/i.test(file.name)) {
    return file
  }
  const mime = resolveMimeForUpload(file)
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "image/avif" ? "avif" : "jpg"
  const raw = file.name?.replace(/[/\\]/g, "_").trim() || "image"
  const base = raw.includes(".") ? raw.slice(0, raw.lastIndexOf(".")) : raw
  const safeBase = base.replace(/[\r\n"]/g, "_") || "image"
  return new File([file], `${safeBase}.${ext}`, { type: mime, lastModified: file.lastModified })
}

function formDataWithFile(file: File): FormData {
  const fd = new FormData()
  fd.append("file", ensureUploadFileName(file))
  return fd
}

/** Ответ `POST /upload-image/...` — публичный URL и метаданные объекта в хранилище */
export type UploadImageResult = {
  bucket: string
  path: string
  contentType: string
  url: string
}

export const postUploadFileQuiz = async (file: File, quizId: string) => {
  return api
    .post<UploadImageResult>(`/upload-image/quiz/${quizId}`, formDataWithFile(file), {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data
      throw new Error("Failed to upload file")
    })
}

/** Загрузка картинки к вопросу (поле `file`). */
export const postUploadFileQuestion = async (file: File, questionId: string) => {
  return api
    .post<UploadImageResult>(`/upload-image/question/${questionId}`, formDataWithFile(file), {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data
      throw new Error("Failed to upload file")
    })
}

export const deleteUploadImageQuestion = async (questionId: string) => {
  return api
    .delete(`/upload-image/question/${questionId}`, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data
      throw new Error("Failed to delete question image")
    })
}
