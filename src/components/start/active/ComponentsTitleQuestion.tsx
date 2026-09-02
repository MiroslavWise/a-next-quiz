import { type CSSProperties } from "react"

import TimerSeconds from "./TimerSeconds"

import { cn } from "@/lib/utils"
import type { IQuestion } from "@/interface/question"

import { formatCountdown, useQuestionCountdown } from "../hooks/use-question-countdown"

import styles from "../styles/optimal.module.scss"

interface IProps extends Partial<IQuestion> {
  activeIndex?: number
  start?: unknown
  /** Полоска + цифры (ведущий / наблюдатель). */
  showTimer?: boolean
  /** Кольцевой циферблат на рамке (участник). */
  showParticipantRing?: boolean
}

const ROUND_CLASS = "rounded-xl xl:rounded-2xl"

function ComponentsTitleQuestion({
  activeIndex = 0,
  title,
  start,
  time = 0,
  showTimer = false,
  showParticipantRing = false,
  imageUrl,
  image_url,
  bonuses,
}: IProps) {
  const thumbUrl = imageUrl ?? image_url
  const { totalSeconds, remainingSeconds, ringAngle } = useQuestionCountdown({ start, time })

  const participantRingActive = showParticipantRing && totalSeconds > 0
  const titleText = title ?? "Ожидаем текст вопроса..."

  const card = (
    <div
      className={cn(
        "glass-start-liquid-palette relative isolate flex w-full flex-col items-center border border-(--accent-orb)/40 text-center text-[#c7d2fe] transition-all duration-300",
        ROUND_CLASS,
      )}
    >
      <TimerSeconds remainingSeconds={remainingSeconds} compact />
      <div
        className={cn(
          "relative flex w-full flex-col gap-2 p-2.5 pt-4.5",
          showTimer || participantRingActive ? "" : "items-center justify-center",
        )}
      >
        {thumbUrl ? (
          <div className="mx-auto aspect-video w-full max-w-[min(100%,15rem)] shrink-0 overflow-hidden rounded-lg border border-(--accent-orb)/40 bg-white/6 sm:max-w-[min(100%,22rem)] lg:max-w-[min(100%,27rem)]">
            <img src={thumbUrl} alt={titleText} className="aspect-video size-full object-cover" loading="lazy" decoding="async" />
          </div>
        ) : null}
        <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-0.5 py-0">
          <div className="relative z-10 flex min-h-14 items-center justify-center text-center">
            <p className="max-w-[92%] font-mono text-base leading-snug font-medium text-balance whitespace-pre-wrap text-[#c7d2fe] sm:text-lg lg:text-xl lg:leading-normal">
              {titleText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  if (!participantRingActive) {
    return <div className="w-full">{card}</div>
  }

  return (
    <div className="w-full">
      <div
        style={{ "--ring-angle": `${ringAngle}deg` } as CSSProperties}
        role="timer"
        aria-live="polite"
        aria-label={`Осталось ${formatCountdown(remainingSeconds)}`}
        className={cn("relative w-full p-0.5", ROUND_CLASS, styles.ringWrapStyle)}
      >
        {card}
      </div>
    </div>
  )
}

ComponentsTitleQuestion.displayName = "ComponentsTitleQuestion"
export default ComponentsTitleQuestion
