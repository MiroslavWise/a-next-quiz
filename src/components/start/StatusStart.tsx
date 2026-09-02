"use client"

import { useEffect } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

function StatusStart({ refetch }: { refetch: () => void }) {
  useEffect(() => {
    const refetchTimeout = setTimeout(() => {
      refetch()
    }, 7_000)

    return () => {
      clearTimeout(refetchTimeout)
    }
  }, [])

  return (
    <div className="relative flex h-dvh w-full flex-1 items-center justify-center px-4 py-10 pt-12">
      <div
        className="glass-start-liquid-palette w-full max-w-sm space-y-5 overflow-hidden px-6 py-8 text-center sm:max-w-md sm:px-8 sm:py-10"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/8">
          <DotLottieReact src="/lottie/loading.lottie" className="size-12" loop autoplay backgroundColor="transparent" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-balance text-white sm:text-2xl">Игра начинается</h2>
        <p className="text-sm leading-relaxed text-pretty text-white/65">Подготовьтесь: первый вопрос откроется через несколько секунд.</p>
      </div>
    </div>
  )
}

StatusStart.displayName = "StatusStart"
export default StatusStart
