"use client"

import { Check } from "lucide-react"
import { useEffect, useRef, useState, type CSSProperties } from "react"

import { cn } from "@/lib/utils"
import { START_SPLASH_SECONDS } from "@/lib/game-streak-tiers"

import styles from "./styles/start-splash.module.scss"

const CARD_COUNT = 5
const STEPS = ["Колода", "Таймеры", "Варианты"] as const
const BAR_WIDTHS = [
  ["74%", "48%"],
  ["62%", "36%"],
  ["80%", "52%"],
  ["56%", "40%"],
  ["68%", "32%"],
] as const

const SPLASH_MS = START_SPLASH_SECONDS * 1000
const COUNTER_START_MS = SPLASH_MS * 0.08
const COUNTER_END_MS = SPLASH_MS * 0.76
const FINALE_MS = SPLASH_MS * 0.84
const STEP_MS = [SPLASH_MS * 0.24, SPLASH_MS * 0.52, SPLASH_MS * 0.76] as const

const splashStyle = {
  "--splash": START_SPLASH_SECONDS,
  "--back": CARD_COUNT - 1,
} as CSSProperties

type StatusStartProps = {
  refetch: () => void
  questionCount: number
  quizName?: string | null
}

function questionsPhrase(count: number) {
  const abs = Math.abs(count)
  const mod10 = abs % 10
  const mod100 = abs % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} вопрос`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} вопроса`
  return `${count} вопросов`
}

function statusMessage(total: number, finale: boolean) {
  if (finale) return "Игра начинается"
  if (total > 0) return `Собираем ${questionsPhrase(total)}`
  return "Собираем вопросы"
}

/** Заставка START: пустая колода, без текста вопросов. */
function StatusStart({ refetch, questionCount, quizName }: StatusStartProps) {
  const total = Number.isFinite(questionCount) && questionCount > 0 ? Math.trunc(questionCount) : 0
  const quizTitle = quizName?.trim() ?? ""
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch

  const [shown, setShown] = useState(0)
  const [doneSteps, setDoneSteps] = useState(0)
  const [finale, setFinale] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => refetchRef.current(), 7_000)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setShown(total)
      setDoneSteps(STEPS.length)
      setFinale(true)
      return
    }

    setShown(0)
    setDoneSteps(0)
    setFinale(false)

    let frame = 0
    const started = performance.now()
    const tick = (now: number) => {
      const elapsed = now - started
      if (total > 0 && elapsed >= COUNTER_START_MS) {
        const span = Math.max(1, COUNTER_END_MS - COUNTER_START_MS)
        const progress = Math.min(1, (elapsed - COUNTER_START_MS) / span)
        const eased = 1 - (1 - progress) ** 3
        const next = Math.min(total, Math.round(eased * total))
        setShown((prev) => (prev === next ? prev : next))
      }
      if (elapsed < COUNTER_END_MS) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)

    const timers = STEP_MS.map((at, index) => window.setTimeout(() => setDoneSteps(index + 1), at))
    timers.push(window.setTimeout(() => setFinale(true), FINALE_MS))

    return () => {
      window.cancelAnimationFrame(frame)
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [total])

  return (
    <div
      className={cn(
        styles.root,
        finale && styles.settled,
        "flex min-h-[calc(100svh-7.5rem)] w-full flex-col items-center justify-between gap-6 px-4 pt-2 pb-8",
      )}
      style={splashStyle}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage(total, finale)}
      </p>

      <div aria-hidden className="flex w-full flex-1 flex-col items-center justify-between gap-6">
        <header className={cn(styles.header, "flex w-full max-w-82 flex-col items-center gap-2 text-center")}>
          {quizTitle ? <p className="glass-start-meta w-full truncate">{quizTitle}</p> : null}
          <div className={styles.captionSlot}>
            <h2 className={cn(styles.loadLine, "text-xl font-semibold tracking-tight text-balance text-white sm:text-2xl")}>
              Собираем колоду
            </h2>
            <h2 className={cn(styles.finaleLine, "text-xl font-semibold tracking-tight text-balance text-white sm:text-2xl")}>
              Игра начинается
            </h2>
          </div>
        </header>

        <div className={styles.stage}>
          <div className={styles.deck}>
            {BAR_WIDTHS.map((widths, index) => (
              <article
                key={index}
                className={cn("px-3.5 pt-2.5", styles.card, total > CARD_COUNT && index === CARD_COUNT - 1 && styles.cardTop)}
                style={{ "--slot": index } as CSSProperties}
              >
                <div className="flex h-5 items-center justify-between">
                  <span className="text-[0.65rem] font-medium tracking-[0.2em] text-white/55">{String(index + 1).padStart(2, "0")}</span>
                  <span className="size-1.5 rounded-full bg-(--accent-orb)" />
                </div>
                <div className={styles.bars}>
                  <span className={styles.bar} style={{ width: widths[0] }} />
                  <span className={styles.bar} style={{ width: widths[1] }} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className={cn(styles.panel, "glass-start-liquid-palette rounded-2xl px-4 py-3.5")}>
          <p className="text-[0.65rem] font-medium tracking-[0.18em] text-white/45 uppercase">{total > 0 ? "в колоде" : "колода"}</p>
          {total > 0 ? (
            <p className="mt-1 font-semibold tracking-tight text-white tabular-nums">
              <span className={cn(styles.liveCount, "text-2xl")}>{shown}</span>
              <span className={cn(styles.finalCount, "text-2xl")}>{total}</span>
              <span className="text-base text-white/40"> / {total}</span>
            </p>
          ) : (
            <p className="mt-1 text-lg font-semibold tracking-tight text-white">Вопросы</p>
          )}
          <div className={cn(styles.track, "mt-3")}>
            <span className={styles.fill} />
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {STEPS.map((label, index) => {
              const done = doneSteps > index
              return (
                <li key={label} className="flex items-center gap-2.5 text-sm text-white/80">
                  <span className={cn(styles.mark, done && styles.markOn)}>
                    <Check className={cn(styles.checkIcon, "size-3")} strokeWidth={2.5} />
                  </span>
                  {label}
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}

StatusStart.displayName = "StatusStart"
export default StatusStart
