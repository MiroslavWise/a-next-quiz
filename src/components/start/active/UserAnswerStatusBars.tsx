"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { EUsersAnswerStatus, type IUsersAnswerStatusEntry } from "@/api/reports"
import { formatQuizPoints } from "@/lib/quiz-points"

type TResolvedAnswerStatus = IUsersAnswerStatusEntry | { result: EUsersAnswerStatus.WAITING; points: number }

const WAITING_ENTRY: TResolvedAnswerStatus = { result: EUsersAnswerStatus.WAITING, points: 0 }

function isWaitingEntry(entry: TResolvedAnswerStatus): entry is { result: EUsersAnswerStatus.WAITING; points: number } {
  return entry.result === EUsersAnswerStatus.WAITING
}

const STATUS_BAR_CLASS: Record<EUsersAnswerStatus, string> = {
  [EUsersAnswerStatus.CORRECT]:
    "bg-(--faithful) shadow-[0_0_6px_color-mix(in_srgb,var(--faithful)_60%,transparent)]",
  [EUsersAnswerStatus.WRONG]:
    "bg-(--unfaithful) shadow-[0_0_6px_color-mix(in_srgb,var(--unfaithful)_60%,transparent)]",
  [EUsersAnswerStatus.SKIPPED]: "bg-slate-400",
  [EUsersAnswerStatus.WAITING]: "bg-white/25",
}

const STATUS_LABEL: Record<EUsersAnswerStatus, string> = {
  [EUsersAnswerStatus.CORRECT]: "Верно",
  [EUsersAnswerStatus.WRONG]: "Неверно",
  [EUsersAnswerStatus.SKIPPED]: "Пропуск",
  [EUsersAnswerStatus.WAITING]: "Ожидание",
}

export interface IUserAnswerStatusBarsProps {
  totalQuestions: number
  /** Статусы и очки с бэкенда по индексу вопроса; отсутствующий индекс = waiting. */
  entriesByIndex?: Map<number, IUsersAnswerStatusEntry>
  /** 0-based индекс активного вопроса. */
  activeIndex?: number
  /** Активный вопрос закрыт (`END`) — без мигания. */
  isQuestionEnded?: boolean
}

interface ITooltipState {
  index: number
  entry: IUsersAnswerStatusEntry
  x: number
  y: number
  placement: "top" | "bottom"
}

function isRealEntry(entry: TResolvedAnswerStatus): entry is IUsersAnswerStatusEntry {
  return !isWaitingEntry(entry)
}

const MIN_BAR_HEIGHT_PCT = 6
const AUTO_CLOSE_MS = 3_500

function resolveStatus(
  index: number,
  entriesByIndex: Map<number, IUsersAnswerStatusEntry> | undefined,
): TResolvedAnswerStatus {
  return entriesByIndex?.get(index) ?? WAITING_ENTRY
}

function computeScale(entries: Iterable<IUsersAnswerStatusEntry>): number {
  let maxAbs = 0
  for (const entry of entries) {
    maxAbs = Math.max(maxAbs, Math.abs(entry.points))
  }
  return maxAbs
}

function UserAnswerStatusBars({
  totalQuestions,
  entriesByIndex,
  activeIndex,
  isQuestionEnded = false,
}: IUserAnswerStatusBarsProps) {
  const safeTotal = Math.max(0, totalQuestions)
  const [tooltip, setTooltip] = useState<ITooltipState | null>(null)
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scale = useMemo(() => computeScale(entriesByIndex?.values() ?? []), [entriesByIndex])

  const clearAutoClose = useCallback(() => {
    if (autoCloseRef.current) {
      clearTimeout(autoCloseRef.current)
      autoCloseRef.current = null
    }
  }, [])

  const closeTooltip = useCallback(() => {
    clearAutoClose()
    setTooltip(null)
  }, [clearAutoClose])

  const handleBarClick = useCallback(
    (index: number, entry: IUsersAnswerStatusEntry, trigger: HTMLElement) => {
      clearAutoClose()

      // Повторный клик по тому же бару закрывает тултип.
      if (tooltip?.index === index) {
        setTooltip(null)
        return
      }

      const rect = trigger.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      const placement = spaceAbove > spaceBelow ? "top" : "bottom"
      const gap = 8
      const y = placement === "top" ? rect.top - gap : rect.bottom + gap

      setTooltip({ index, entry, x: centerX, y, placement })

      autoCloseRef.current = setTimeout(() => {
        setTooltip(null)
      }, AUTO_CLOSE_MS)
    },
    [tooltip, clearAutoClose],
  )

  // Закрываем тултип при скролле/ресайзе, чтобы он не "плавал" отдельно от бара.
  useEffect(() => {
    if (!tooltip) return

    const onScroll = () => closeTooltip()
    const onResize = () => closeTooltip()

    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
    }
  }, [tooltip, closeTooltip])

  useEffect(() => {
    return () => clearAutoClose()
  }, [clearAutoClose])

  if (!safeTotal) return null

  const tooltipResultLabel = tooltip ? STATUS_LABEL[tooltip.entry.result] : ""
  const tooltipPoints = tooltip ? formatQuizPoints(tooltip.entry.points) : ""
  const tooltipSign = tooltip && tooltip.entry.points > 0 ? "+" : ""

  return (
    <>
      <div
        className="relative flex h-6 w-full flex-row items-stretch gap-px"
        role="list"
        aria-label="Очки по вопросам"
      >
        {/* Нулевая линия (базовый уровень). */}
        <span
          className="pointer-events-none absolute top-1/2 left-0 right-0 z-0 h-px bg-white/10"
          aria-hidden
        />
        {Array.from({ length: safeTotal }).map((_, index) => {
          const entry = resolveStatus(index, entriesByIndex)
          const isWaiting = entry.result === EUsersAnswerStatus.WAITING
          const isActive = activeIndex === index
          const pulseActive = isActive && !isQuestionEnded

          const absPoints = Math.abs(entry.points)
          const hasPoints = scale > 0 && !isWaiting
          const heightPct = hasPoints
            ? Math.max(MIN_BAR_HEIGHT_PCT, (absPoints / scale) * 50)
            : MIN_BAR_HEIGHT_PCT

          const entryPoints = isWaiting ? 0 : entry.points
          const entrySign = entryPoints > 0 ? "+" : ""
          const entryPointsFormatted = isWaiting ? "0" : formatQuizPoints(entryPoints)

          const label = isWaiting
            ? `Вопрос ${index + 1}: ${STATUS_LABEL[EUsersAnswerStatus.WAITING]}`
            : `Вопрос ${index + 1}: ${STATUS_LABEL[entry.result]}, ${entrySign}${entryPointsFormatted} очков`

          return (
            <button
              key={`user-answer-status-${index}`}
              type="button"
              role="listitem"
              aria-label={label}
              title={isWaiting ? label : undefined}
              disabled={isWaiting}
              onClick={
                isRealEntry(entry)
                  ? (e) => handleBarClick(index, entry, e.currentTarget)
                  : undefined
              }
              className={cn(
                "relative flex flex-1 cursor-pointer items-center justify-center rounded-[1px] transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
                isWaiting && "cursor-default opacity-60",
                pulseActive && "animate-pulse",
              )}
            >
              <span
                className={cn(
                  "w-full rounded-[1px]",
                  STATUS_BAR_CLASS[entry.result],
                  pulseActive && "opacity-80",
                )}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: `${heightPct}%`,
                  ...(entry.points >= 0 ? { bottom: "50%" } : { top: "50%" }),
                }}
              />
            </button>
          )
        })}
      </div>

      {tooltip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={cn(
              "fixed z-[200] max-w-[10rem] rounded-lg border border-white/15 bg-black/85 px-2.5 py-1.5 text-center shadow-xl backdrop-blur-sm",
              tooltip.placement === "top" && "-translate-x-1/2 -translate-y-full",
              tooltip.placement === "bottom" && "-translate-x-1/2 translate-y-0",
            )}
            style={{ left: tooltip.x, top: tooltip.y }}
            role="tooltip"
          >
            <span className="block text-[0.6rem] leading-none font-medium text-white/80">
              Вопрос {tooltip.index + 1}
            </span>
            <span
              className={cn(
                "mt-1 block text-xs leading-none font-bold tabular-nums",
                tooltip.entry.result === EUsersAnswerStatus.CORRECT && "text-emerald-300",
                tooltip.entry.result === EUsersAnswerStatus.WRONG && "text-rose-300",
                tooltip.entry.result === EUsersAnswerStatus.SKIPPED && "text-slate-300",
              )}
            >
              {tooltipSign}
              {tooltipPoints}
            </span>
            <span className="mt-0.5 block text-[0.55rem] leading-none text-white/60">
              {tooltipResultLabel}
            </span>
          </div>,
          document.body,
        )}
    </>
  )
}

UserAnswerStatusBars.displayName = "UserAnswerStatusBars"
export default UserAnswerStatusBars
