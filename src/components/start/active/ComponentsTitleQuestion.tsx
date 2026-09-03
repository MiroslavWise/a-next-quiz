import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import type { ReactNode } from "react"

import TimerSeconds from "./TimerSeconds"

import { getRank } from "@/api/rank"
import { elementThemeById, resolveElementThemeId } from "@/constants/palette"
import type { IQuestion } from "@/interface/question"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/auth"
import { useElementThemeSession } from "@/stores/element-theme-session"

import { useQuestionCountdown } from "../hooks/use-question-countdown"

interface IProps extends Partial<IQuestion> {
  start?: unknown
  reportId?: string
  tgId?: number
  activeIndex?: number
  ended?: boolean
  showMeta?: boolean
  children?: ReactNode
}

const ROUND_CLASS = "rounded-2xl xl:rounded-3xl"

function RoundMeta({ reportId, tgId, activeIndex }: { reportId?: string; tgId?: number; activeIndex?: number }) {
  const element = useAuth((s) => s.user?.element)
  const isGameAvatar = useElementThemeSession((s) => s.isGameAvatar)
  const theme = elementThemeById(resolveElementThemeId(element, isGameAvatar))

  const { data } = useQuery({
    queryKey: ["rank", reportId, tgId, activeIndex],
    queryFn: () => getRank(reportId!),
    enabled: !!reportId && !!tgId,
  })

  const streak = Math.max(0, Number(data?.streak ?? 0) || 0)

  return (
    <p className="glass-start-meta">
      {theme.label.toLowerCase()}
      <span className="mx-1.5 text-white/35">·</span>
      серия {streak}
    </p>
  )
}

function ComponentsTitleQuestion({
  title,
  start,
  time = 0,
  imageUrl,
  image_url,
  reportId,
  tgId,
  activeIndex,
  ended = false,
  showMeta = true,
  children,
}: IProps) {
  const thumbUrl = imageUrl ?? image_url
  const { remainingSeconds, totalSeconds } = useQuestionCountdown({ start, time })

  const titleText = title ?? "Ожидаем текст вопроса..."

  if (ended) {
    return (
      <div className="flex w-full flex-col items-center gap-2 text-center">
        <p className="text-[0.7rem] font-medium tracking-[0.16em] text-white/40">Вопрос завершён</p>
        <h2 className="max-w-[22rem] text-xl leading-snug font-semibold text-balance text-white sm:text-2xl">{titleText}</h2>
        <p className="text-xs font-medium text-faithful/90">Правильный ответ</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {showMeta ? <RoundMeta reportId={reportId} tgId={tgId} activeIndex={activeIndex} /> : null}
      <TimerSeconds remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} />
      {children}
      <div
        className={cn(
          "glass-start-liquid-palette relative isolate flex w-full flex-col items-center border text-center text-white transition-all duration-300",
          ROUND_CLASS,
        )}
      >
        <div className="relative flex w-full flex-col items-center justify-center gap-2 p-3.5 sm:p-4">
          {thumbUrl ? (
            <div className="relative mx-auto aspect-video w-full max-w-[min(100%,15rem)] shrink-0 overflow-hidden rounded-lg border border-(--accent-orb)/40 bg-white/6 sm:max-w-[min(100%,22rem)] lg:max-w-[min(100%,27rem)]">
              <Image
                src={thumbUrl}
                alt={titleText}
                fill
                sizes="(max-width: 640px) 15rem, (max-width: 1024px) 22rem, 27rem"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-0.5 py-1">
            <p className="max-w-[92%] text-base leading-snug font-medium text-balance whitespace-pre-wrap text-white sm:text-lg lg:text-xl lg:leading-normal">
              {titleText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

ComponentsTitleQuestion.displayName = "ComponentsTitleQuestion"
export default ComponentsTitleQuestion
