"use client"

import { useEffect, useState } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

import { cn } from "@/lib/utils"

const PRIZE_LOTTIE_SRC = "/lottie/prize.lottie"

let prizeLottieData: Promise<ArrayBuffer> | null = null

function loadPrizeLottie(): Promise<ArrayBuffer> {
  prizeLottieData ??= fetch(PRIZE_LOTTIE_SRC).then((res) => {
    if (!res.ok) {
      prizeLottieData = null
      throw new Error(`Failed to load ${PRIZE_LOTTIE_SRC}`)
    }
    return res.arrayBuffer()
  })
  return prizeLottieData
}

interface PrizeLottieProps {
  className?: string
}

export default function PrizeLottie({ className }: PrizeLottieProps) {
  const [data, setData] = useState<ArrayBuffer | null>(null)

  useEffect(() => {
    let cancelled = false
    loadPrizeLottie()
      .then((buf) => {
        if (!cancelled) setData(buf.slice(0))
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", className)} aria-hidden>
      {data ? <DotLottieReact data={data} loop autoplay speed={0.75} backgroundColor="transparent" className="size-full" /> : null}
    </span>
  )
}
