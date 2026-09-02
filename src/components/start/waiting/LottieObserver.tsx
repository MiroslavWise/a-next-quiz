"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

function LottieObserver() {
  return (
    <div className="absolute -top-1 -right-1 z-10">
      <DotLottieReact src={`/lottie/Illuminati.lottie`} loop autoplay backgroundColor="transparent" className="size-6 sm:size-8" />
    </div>
  )
}

LottieObserver.displayName = "LottieObserver"
export default LottieObserver
