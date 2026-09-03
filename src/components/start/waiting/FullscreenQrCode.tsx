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
      className="fixed inset-0 z-100 flex min-h-svh flex-col items-center justify-center bg-black/80 p-5 text-center text-white backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fullscreen-qr-title"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="glass-start-liquid-palette flex w-full max-w-lg flex-col items-center gap-5 rounded-2xl p-5 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-(--accent-orb)/85">
          <QrCode className="size-5" aria-hidden />
          <h2 id="fullscreen-qr-title" className="text-lg font-semibold text-white sm:text-xl">
            Присоединиться к игре
          </h2>
        </div>
        <div className="rounded-2xl bg-white p-4 sm:p-5">
          <QRCodeSVG
            value={url}
            size={640}
            level="M"
            includeMargin
            className="h-auto w-[min(68vw,68svh)] max-w-full"
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
