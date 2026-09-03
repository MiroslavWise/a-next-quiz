"use client"

import { useEffect } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

const RING_RADIUS = 42
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

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
    <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 px-4 pt-4">
      <p className="glass-start-meta">старт</p>
      <div className="relative isolate flex size-28 items-center justify-center sm:size-32" aria-hidden>
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
          <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4.5" />
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--accent-orb)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            style={{
              filter: "drop-shadow(0 0 8px color-mix(in srgb, var(--accent-orb) 75%, transparent))",
            }}
          />
        </svg>
        <DotLottieReact
          src="/lottie/loading.lottie"
          className="relative z-10 size-12"
          loop
          autoplay
          backgroundColor="transparent"
        />
      </div>
      <div
        className="glass-start-liquid-palette w-full max-w-sm space-y-3 overflow-hidden rounded-2xl px-6 py-8 text-center sm:max-w-md sm:px-8 sm:py-10"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-xl font-semibold tracking-tight text-balance text-white sm:text-2xl">Игра начинается</h2>
        <p className="text-sm leading-relaxed text-pretty text-white/65">Подготовьтесь: первый вопрос откроется через несколько секунд.</p>
      </div>
    </div>
  )
}

StatusStart.displayName = "StatusStart"
export default StatusStart
