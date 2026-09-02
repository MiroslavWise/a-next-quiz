import TimerSeconds from "./TimerSeconds"

import { cn } from "@/lib/utils"
import type { IQuestion } from "@/interface/question"

import { useQuestionCountdown } from "../hooks/use-question-countdown"

interface IProps extends Partial<IQuestion> {
  start?: unknown
}

const ROUND_CLASS = "rounded-xl xl:rounded-2xl"

function ComponentsTitleQuestion({ title, start, time = 0, imageUrl, image_url }: IProps) {
  const thumbUrl = imageUrl ?? image_url
  const { remainingSeconds } = useQuestionCountdown({ start, time })

  const titleText = title ?? "Ожидаем текст вопроса..."

  return (
    <div className="w-full">
      <div
        className={cn(
          "glass-start-liquid-palette relative isolate flex w-full flex-col items-center border border-(--accent-orb)/40 text-center text-[#c7d2fe] transition-all duration-300",
          ROUND_CLASS,
        )}
      >
        <TimerSeconds remainingSeconds={remainingSeconds} compact />
        <div className="relative flex w-full flex-col items-center justify-center gap-2 p-2.5 pt-4.5">
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
    </div>
  )
}

ComponentsTitleQuestion.displayName = "ComponentsTitleQuestion"
export default ComponentsTitleQuestion
