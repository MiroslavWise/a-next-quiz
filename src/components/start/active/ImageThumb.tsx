import Image from "next/image"
import { motion } from "motion/react"
import { AnimateView } from "motion/react-animate-view"
import { useState, startTransition, useEffect } from "react"

import { generateRandomSquares } from "../lib/image"

interface IProps {
  thumbUrl: string
  titleText: string
}

function ImageThumb({ thumbUrl, titleText }: IProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [clipPath, setClipPath] = useState("")
  const [targetClip, setTargetClip] = useState("")

  useEffect(() => {
    const { full, collapsed } = generateRandomSquares(25)

    setClipPath(collapsed)
    setTargetClip(full)

    requestAnimationFrame(() => {
      startTransition(() => {
        setIsVisible(true)

        setTimeout(() => setClipPath(full), 50)
      })
    })
  }, [])

  return (
    <div className="relative mx-auto aspect-video w-full max-w-[min(100%,15rem)] shrink-0 overflow-hidden rounded-lg border border-(--accent-orb)/40 bg-white/6 sm:max-w-[min(100%,22rem)] lg:max-w-[min(100%,27rem)]">
      {isVisible && (
        <AnimateView
          enter={{
            clipPath: [clipPath, targetClip],
            transition: {
              duration: 0.8,
              ease: "easeOut",
              delay: 0.2,
            },
          }}
          exit={{
            clipPath: [targetClip, clipPath],
            transition: { duration: 0.4, ease: "easeIn" },
          }}
          // enter={{
          //   clipPath: ["circle(0% at 50% 50%)", "circle(75% at 50% 50%)"],
          //   transition: { duration: 0.6, ease: "easeOut" },
          // }}
          // exit={{
          //   clipPath: ["circle(75% at 50% 50%)", "circle(0% at 50% 50%)"],
          //   transition: { duration: 0.4, ease: "easeIn" },
          // }}
        >
          <Image
            fill
            src={thumbUrl}
            alt={titleText}
            sizes="(max-width: 640px) 15rem, (max-width: 1024px) 22rem, 27rem"
            className="object-cover"
          />
        </AnimateView>
      )}
    </div>
  )
}

ImageThumb.displayName = "ImageThumb"
export default ImageThumb
