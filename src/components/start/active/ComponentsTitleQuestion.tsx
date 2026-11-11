import { Flame, Sparkles, Swords } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useMemo, type CSSProperties, type ReactNode } from "react"

import ImageThumb from "./ImageThumb"
import TimerSeconds from "./TimerSeconds"
import ElementStateChips from "./ElementStateChips"
import QuestionBonuses from "./QuestionBonuses"
import QuestionElementMark from "./QuestionElementMark"

import { cn } from "@/lib/utils"
import { getRank } from "@/api/rank"
import { useAuth } from "@/stores/auth"
import { QuestionBonus } from "@/enum/question-bonus"
import type { IQuestion } from "@/interface/question"
import { questionElementVisual } from "@/lib/question-element"
import { useQuestionCountdown } from "../hooks/use-question-countdown"
import { useElementThemeSession } from "@/stores/element-theme-session"
import { elementThemeById, resolveElementThemeId } from "@/constants/palette"

interface IProps extends Partial<IQuestion> {
  start?: unknown
  reportId?: string
  tgId?: number
  activeIndex?: number
  ended?: boolean
  /** Живой отсчёт. У ведущего карточка остаётся, но после конца вопроса секунды не идут. */
  showTimer?: boolean
  showMeta?: boolean
  /** Индикатор вопросов: садится на центр верхнего бордера карточки. */
  dots?: ReactNode
  /** Активированные скилы ведущего/наблюдателя — справа снизу, как бафы слева. */
  staffSkills?: ReactNode
}

const ROUND_CLASS = "rounded-lg"

const SEAL_VARS = {
  "--seal-size": "1.75rem",
  "--seal-air": "4px",
  "--seal-stroke": "2px",
  "--seal-center": "calc(var(--seal-size) / 2 - var(--seal-size) / 3)",
  "--seal-notch": "calc(var(--seal-size) / 2 + var(--seal-air) + var(--seal-stroke))",
} as CSSProperties

const SEAL_FILL_MASK =
  "radial-gradient(circle at calc(var(--seal-center) + var(--seal-stroke)) calc(var(--seal-center) + var(--seal-stroke)), transparent calc(var(--seal-notch) - 0.5px), #000 var(--seal-notch))"

const DECISIVE_BADGE = {
  Icon: Swords,
  label: "Решающий · base ×1.5",
  title: "Решающий раунд: базовые очки вопроса ×1.5",
  ariaLabel: "Решающий раунд: базовые очки вопроса умножаются на 1.5",
} as const

const HOT_BADGE = {
  Icon: Flame,
  label: "Горячий · speed ×1.35",
  title: "Горячий вопрос: очки за скорость ×1.35",
  ariaLabel: "Горячий вопрос: очки за скорость умножаются на 1.35",
} as const

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
  showTimer = true,
  showMeta = true,
  bonuses,
  element,
  hot,
  decisive,
  dots,
  staffSkills,
}: IProps) {
  const thumbUrl = imageUrl ?? image_url
  const profileElement = useAuth((s) => s.user?.element)
  const isGameAvatar = useElementThemeSession((s) => s.isGameAvatar)
  const elementVisual = questionElementVisual(element)
  const resonant = showMeta && !!elementVisual && !isGameAvatar && profileElement === elementVisual.id
  const { remainingSeconds, totalSeconds } = useQuestionCountdown({ start, time, enabled: showTimer && !ended })
  const elementsBoosted = !ended && !!bonuses?.includes(QuestionBonus.ALL_ELEMENTS_BOOST)
  const isHot = !ended && !!hot
  const isDecisive = !ended && !!decisive

  const titleText = title ?? "Ожидаем текст вопроса..."

  const badges = useMemo(() => {
    if (!isDecisive && !isHot) return []
    const array = []

    if (isDecisive) array.push(DECISIVE_BADGE)
    if (isHot) array.push(HOT_BADGE)

    return array
  }, [isDecisive, isHot])

  return (
    <div className={cn("flex w-full flex-col items-center gap-3", !badges.length && "pt-3")}>
      {!ended && (
        <>
          {showMeta ? <RoundMeta reportId={reportId} tgId={tgId} activeIndex={activeIndex} /> : null}
          {showTimer ? <TimerSeconds remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} /> : null}
          {!!badges.length && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {badges.map(({ label, title, ariaLabel, Icon }) => (
                <p
                  key={label}
                  className="game-slab inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-[0.08em] uppercase text-(--accent-orb)"
                  title={title}
                  aria-label={ariaLabel}
                >
                  <Icon className="size-3 text-(--accent-orb)" aria-hidden />
                  {label}
                </p>
              ))}
            </div>
          )}
          {showMeta ? <ElementStateChips reportId={reportId} activeIndex={activeIndex} /> : null}
        </>
      )}
      <div className={cn("relative w-full overflow-visible", elementVisual && ROUND_CLASS)} style={SEAL_VARS}>
        <div
          className={cn(
            "glass-start-liquid-palette relative isolate flex w-full flex-col items-center overflow-visible text-center text-white transition-all duration-300",
            ROUND_CLASS,
            !elementVisual && elementsBoosted && "border-(--accent-orb)",
          )}
          style={
            elementVisual
              ? {
                  borderColor: elementVisual.accentColor,
                  borderWidth: 2,
                  boxShadow: `6px 6px 0 0 color-mix(in srgb, ${elementVisual.accentColor} 55%, #0a0c0b 45%)`,
                  maskImage: SEAL_FILL_MASK,
                  WebkitMaskImage: SEAL_FILL_MASK,
                  maskMode: "alpha",
                  maskRepeat: "no-repeat",
                  maskSize: "100% 100%",
                }
              : undefined
          }
        >
          {elementsBoosted ? (
            <span className={cn("pointer-events-none absolute inset-0 border-2 border-(--accent-orb)", ROUND_CLASS)} aria-hidden />
          ) : null}
          <div className={cn("flex w-full flex-col items-center", dots && "pt-2.5")}>
            {elementsBoosted ? (
              <p className="game-slab mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-[0.12em] text-white uppercase">
                <Sparkles className="size-3 text-(--accent-orb)" aria-hidden />
                Стихии усилены
              </p>
            ) : null}
            {ended && <p className="question-ended-in text-[0.7rem] font-medium tracking-[0.16em] text-white/40">Вопрос завершён</p>}
            <div className={cn("relative z-1 flex w-full flex-col items-center justify-center gap-2 p-3.5 sm:p-4")}>
              {!!thumbUrl && <ImageThumb thumbUrl={thumbUrl!} titleText={titleText} />}
              <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-0.5 py-1">
                <p className="max-w-[92%] leading-snug font-medium text-balance whitespace-pre-wrap text-white text-base sm:text-lg lg:text-xl lg:leading-normal xl:text-5xl">
                  {titleText}
                </p>
              </div>
            </div>
          </div>
          <QuestionElementMark element={element} variant="stamp" part="wash" resonant={resonant} />
        </div>
        {dots}
        {elementVisual ? (
          <span aria-hidden className={cn("pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]")}>
            <span
              className="absolute rounded-full border-2"
              style={{
                width: "calc(var(--seal-notch) * 2)",
                height: "calc(var(--seal-notch) * 2)",
                left: "calc(var(--seal-center) - var(--seal-size) / 2 - var(--seal-air))",
                top: "calc(var(--seal-center) - var(--seal-size) / 2 - var(--seal-air))",
                borderColor: elementVisual.accentColor,
              }}
            />
          </span>
        ) : null}
        <QuestionElementMark element={element} variant="stamp" part="stamp" resonant={resonant} />
        {!ended ? (
          <QuestionBonuses
            bonuses={bonuses}
            className="absolute z-20"
            style={{
              left: "calc(var(--seal-stroke) - var(--seal-size) / 3)",
              bottom: "calc(var(--seal-stroke) - var(--seal-size) / 3)",
            }}
          />
        ) : null}
        {staffSkills}
      </div>
    </div>
  )
}

ComponentsTitleQuestion.displayName = "ComponentsTitleQuestion"
export default ComponentsTitleQuestion
