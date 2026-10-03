import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { Sparkles } from "lucide-react"

import ElementStateChips from "./ElementStateChips"
import TimerSeconds from "./TimerSeconds"

import { getRank } from "@/api/rank"
import { elementThemeById, resolveElementThemeId } from "@/constants/palette"
import { QuestionBonus } from "@/enum/question-bonus"
import type { IQuestion } from "@/interface/question"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/auth"
import { useElementThemeSession } from "@/stores/element-theme-session"

import { useQuestionCountdown } from "../hooks/use-question-countdown"
import ImageThumb from "./ImageThumb"

interface IProps extends Partial<IQuestion> {
  start?: unknown
  reportId?: string
  tgId?: number
  activeIndex?: number
  ended?: boolean
  showMeta?: boolean
  /** Индикатор вопросов: садится на центр верхнего бордера карточки. */
  dots?: ReactNode
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
  bonuses,
  dots,
  children,
}: IProps) {
  const thumbUrl = imageUrl ?? image_url
  const { remainingSeconds, totalSeconds } = useQuestionCountdown({ start, time })
  const elementsBoosted = !ended && !!bonuses?.includes(QuestionBonus.ALL_ELEMENTS_BOOST)

  const titleText = title ?? "Ожидаем текст вопроса..."

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {!ended && (
        <>
          {showMeta ? <RoundMeta reportId={reportId} tgId={tgId} activeIndex={activeIndex} /> : null}
          <TimerSeconds remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} />
          {showMeta ? <ElementStateChips reportId={reportId} activeIndex={activeIndex} /> : null}
          {children}
        </>
      )}
      <div
        className={cn(
          "glass-start-liquid-palette relative isolate flex w-full flex-col items-center overflow-visible border text-center text-white shadow-none transition-all duration-300",
          ROUND_CLASS,
          elementsBoosted && "border-(--accent-orb)/60 shadow-[0_0_28px_color-mix(in_srgb,var(--accent-orb)_30%,transparent)]",
        )}
      >
        {dots}
        {elementsBoosted ? (
          <span
            className={cn("pointer-events-none absolute inset-0 ring-2 ring-(--accent-orb)/50 motion-safe:animate-pulse", ROUND_CLASS)}
            aria-hidden
          />
        ) : null}
        <div className={cn("flex w-full flex-col items-center", dots && "pt-2.5")}>
          {elementsBoosted ? (
            <p className="mt-2.5 inline-flex items-center gap-1 rounded-full border border-(--accent-orb)/50 bg-(--accent-orb)/15 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-[0.12em] text-white uppercase">
              <Sparkles className="size-3 text-(--accent-orb)" aria-hidden />
              Стихии усилены
            </p>
          ) : null}
          {ended && (
            <p className="question-ended-in text-[0.7rem] font-medium tracking-[0.16em] text-white/40">Вопрос завершён</p>
          )}
          <div className="relative flex w-full flex-col items-center justify-center gap-2 p-3.5 sm:p-4">
            {!!thumbUrl && <ImageThumb thumbUrl={thumbUrl!} titleText={titleText} />}
            <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-0.5 py-1">
              <p className="max-w-[92%] text-base leading-snug font-medium text-balance whitespace-pre-wrap text-white sm:text-lg lg:text-xl lg:leading-normal">
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
