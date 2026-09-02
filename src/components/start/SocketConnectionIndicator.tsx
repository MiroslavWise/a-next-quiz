import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"

type SocketConnectionIndicatorProps = {
  isConnected: boolean
}

export function SocketConnectionIndicator({ isConnected }: SocketConnectionIndicatorProps) {
  return (
    <span
      className={cn(
        "bottom-next pointer-events-none fixed left-3 z-50 size-2.5 animate-pulse rounded-full",
        isConnected ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]",
      )}
      aria-live="polite"
      aria-label={isConnected ? "Соединение установлено" : "Соединение потеряно, переподключение…"}
      title={isConnected ? "Онлайн" : "Нет связи"}
    />
  )
}

export function WithSocketConnectionIndicator({ isConnected, children }: PropsWithChildren<SocketConnectionIndicatorProps>) {
  return (
    <>
      {children}
      <SocketConnectionIndicator isConnected={isConnected} />
    </>
  )
}
