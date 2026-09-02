"use client"

import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { dismissToast, useToast } from "@/stores/toast"

export default function ToastHost() {
  const message = useToast((s) => s.message)

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[120] flex justify-center px-4"
    >
      <div
        className={cn(
          "pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl border border-(--accent-orb)/45 bg-background/95 px-3.5 py-2.5",
          "text-foreground text-xs font-medium shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md",
        )}
      >
        <Sparkles className="size-3.5 shrink-0 text-(--accent-orb)" aria-hidden />
        <span>{message}</span>
        <button
          type="button"
          aria-label="Закрыть уведомление"
          className="text-muted-foreground hover:text-foreground ml-1 shrink-0 rounded px-1 text-[0.65rem] leading-none transition-colors"
          onClick={dismissToast}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
