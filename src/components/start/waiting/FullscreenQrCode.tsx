"use client"

import { useEffect } from "react"
import { QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

type FullscreenQrCodeProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  sessionCode: string
}

function FullscreenQrCode({ open, onOpenChange, url, sessionCode }: FullscreenQrCodeProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onOpenChange, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-100 flex min-h-svh flex-col items-center justify-center bg-slate-950 p-5 text-center text-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-qr-title"
      onClick={() => onOpenChange(false)}
    >
      <div className="flex w-full max-w-2xl flex-col items-center gap-5">
        <div className="flex items-center gap-2 text-white/75">
          <QrCode className="size-5" aria-hidden />
          <h2 id="fullscreen-qr-title" className="text-lg font-semibold sm:text-xl">
            Присоединиться к игре
          </h2>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
          <QRCodeSVG
            value={url}
            size={640}
            level="M"
            includeMargin
            className="h-auto w-[min(76vw,76svh)] max-w-full"
            title="QR-код для присоединения к игре"
          />
        </div>
        <p className="text-sm text-white/65 sm:text-base">Отсканируйте QR-код камерой телефона</p>
        <p className="font-mono text-lg font-semibold tracking-[0.32em] text-white/90">{sessionCode}</p>
      </div>
    </div>
  )
}

FullscreenQrCode.displayName = "FullscreenQrCode"
export default FullscreenQrCode
