export const IMAGE_UPLOAD_MAX_BYTES = 0.512 * 1024 * 1024

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])
const NAME_EXT = /\.(jpe?g|png|webp|avif)$/i

export const IMAGE_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"

export function isAllowedImageUpload(file: File) {
  if (ALLOWED.has(file.type)) return true
  if (file.type === "" && NAME_EXT.test(file.name)) return true
  return false
}

export function formatImageUploadSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}
