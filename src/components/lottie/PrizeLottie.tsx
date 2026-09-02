"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

import { cn } from "@/lib/utils"

interface PrizeLottieProps {
  className?: string
}

export default function PrizeLottie({ className }: PrizeLottieProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", className)} aria-hidden>
      <DotLottieReact src="/lottie/prize.lottie" loop autoplay speed={0.75} backgroundColor="transparent" className="size-full" />
    </span>
  )
}
