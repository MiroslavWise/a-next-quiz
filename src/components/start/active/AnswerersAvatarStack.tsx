"use client"

import { useState, type CSSProperties } from "react"

import Skeleton from "@/components/ui/skeleton"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import { UserAvatarById, userProfileAdminSubtitle } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import { formatQuizPoints, isNegativeQuizPoints, quizPointsToneClass } from "@/lib/quiz-points"
import type { IAnswerUserEntry } from "@/api/reports"

const VISIBLE_FACES = 10

interface AnswerersAvatarStackProps {
  users: IAnswerUserEntry[]
  viewerTgId: number
  /** Подпись для a11y, напр. «Верно: 3 игрока» */
  ariaLabel?: string
  /** Контролируемое раскрытие (для «один открытый на карточку»). */
  expanded?: boolean
  onExpandedChange?: (open: boolean) => void
  /** Верный — зелёный, неверный — красный, пропуск — янтарный. */
  tone?: "correct" | "wrong" | "abstained"
  className?: string
}

function AnswererRow({ entry, viewerTgId }: { entry: IAnswerUserEntry; viewerTgId: number }) {
  const { telegram_id: telegramId, score } = entry
  const { data, isLoading } = useUserByTgId(telegramId, { enabled: !!telegramId && !!viewerTgId })
  const pseudo = data?.pseudo?.trim() || `Игрок ${telegramId}`
  const telegramLabel = userProfileAdminSubtitle(data)
  const title = telegramLabel ? `${pseudo} · ${telegramLabel}` : pseudo
  const negativeScore = isNegativeQuizPoints(score)

  return (
    <li className="flex w-full min-w-0 items-center gap-2 rounded-md px-1 py-0.5">
      <UserAvatarById
        telegramId={telegramId}
        viewerTgId={viewerTgId}
        variant="leaderboard"
        bare
        wrapperClassName="shrink-0"
        pseudoFallback={() => pseudo}
        className="border-white/25"
        loading={<Skeleton className="size-9 shrink-0 rounded-full border-2 border-white/15" />}
      />
      {isLoading ? (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Skeleton className="h-3.5 w-24 rounded-md bg-white/15" />
          <Skeleton className="h-2.5 w-16 rounded-md bg-white/10" />
        </div>
      ) : (
        <>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5" title={title}>
            <span className="truncate text-sm font-medium text-white/90">{pseudo}</span>
            {telegramLabel ? (
              <span className="truncate text-[0.65rem] leading-tight text-white/55">{telegramLabel}</span>
            ) : null}
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums",
              negativeScore ? "border-rose-400/35 bg-rose-500/15 text-rose-100" : "border-white/15 bg-white/8 text-white/90",
            )}
            title={`Очки за вопрос: ${formatQuizPoints(score)}`}
          >
            <span className={quizPointsToneClass(score, "text-white/90", "text-rose-100")}>{formatQuizPoints(score)}</span>
            <PickaxeIcon points={score} className="size-2.5 shrink-0" />
          </span>
        </>
      )}
    </li>
  )
}

/**
 * Компактный стек аватаров ответивших + раскрытие имён по тапу.
 * Пустой `users` — ничего не рендерит.
 */
export function AnswerersAvatarStack({
  users,
  viewerTgId,
  ariaLabel,
  expanded: expandedControlled,
  onExpandedChange,
  tone = "wrong",
  className,
}: AnswerersAvatarStackProps) {
  const [expandedInternal, setExpandedInternal] = useState(false)
  const isControlled = typeof expandedControlled === "boolean"
  const expanded = isControlled ? expandedControlled : expandedInternal

  if (!users.length) return null

  const visible = users.slice(0, VISIBLE_FACES)
  const overflow = Math.max(0, users.length - visible.length)
  const label = ariaLabel ?? `Ответили: ${users.length}`

  const setExpanded = (open: boolean) => {
    if (!isControlled) setExpandedInternal(open)
    onExpandedChange?.(open)
  }

  const toneClass =
    tone === "correct"
      ? cn(
          "border-emerald-400 bg-emerald-500/25 shadow-[0_0_12px_rgba(52,211,153,0.45)]",
          "hover:border-emerald-300 hover:bg-emerald-500/35",
          "focus-visible:ring-2 focus-visible:ring-emerald-300/80",
          expanded && "border-emerald-300 bg-emerald-500/40 ring-2 ring-emerald-300/50",
        )
      : tone === "abstained"
        ? cn(
            "border-amber-300 bg-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.4)]",
            "hover:border-amber-200 hover:bg-amber-500/30",
            "focus-visible:ring-2 focus-visible:ring-amber-300/80",
            expanded && "border-amber-200 bg-amber-500/35 ring-2 ring-amber-300/45",
          )
        : cn(
            "border-rose-400 bg-rose-500/25 shadow-[0_0_12px_rgba(251,113,133,0.45)]",
            "hover:border-rose-300 hover:bg-rose-500/35",
            "focus-visible:ring-2 focus-visible:ring-rose-300/80",
            expanded && "border-rose-300 bg-rose-500/40 ring-2 ring-rose-300/50",
          )

  return (
    <div className={cn("relative z-10 w-full min-w-0", className)}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={label}
        title={label}
        onClick={(e) => {
          e.stopPropagation()
          setExpanded(!expanded)
        }}
        className={cn(
          "flex max-w-full items-center rounded-full border-2 py-0.5 pr-1.5 pl-0.5 transition-colors",
          "focus-visible:outline-none",
          toneClass,
        )}
      >
        <span className="flex items-center justify-start" aria-hidden>
          {visible.map((entry, index) => (
            <span
              key={entry.telegram_id}
              className="relative shrink-0"
              style={
                {
                  marginLeft: index === 0 ? 0 : "-0.5rem",
                  zIndex: visible.length - index,
                } as CSSProperties
              }
            >
              <UserAvatarById
                telegramId={entry.telegram_id}
                viewerTgId={viewerTgId}
                variant="leaderboard"
                bare
                wrapperClassName="size-7 shrink-0"
                className="size-7 border-2 border-black/50"
                loading={<Skeleton className="size-7 shrink-0 rounded-full border-2 border-white/15" />}
              />
            </span>
          ))}
          {overflow > 0 ? (
            <span
              className="relative z-0 -ml-2 inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-black/50 bg-black/70 text-[0.6rem] font-bold text-white/85 tabular-nums"
              style={{ zIndex: 0 }}
            >
              +{overflow}
            </span>
          ) : null}
        </span>
        <span className="ml-1.5 pr-0.5 text-[0.65rem] font-semibold text-white/70 tabular-nums">{users.length}</span>
      </button>

      {expanded ? (
        <ul
          role="list"
          className="mt-1.5 w-full min-w-[16rem] max-w-md space-y-0.5 overflow-y-auto overscroll-contain rounded-lg border border-white/12 bg-black/50 p-1.5 backdrop-blur-sm [-webkit-overflow-scrolling:touch]"
        >
          {users.map((entry) => (
            <AnswererRow key={entry.telegram_id} entry={entry} viewerTgId={viewerTgId} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

AnswerersAvatarStack.displayName = "AnswerersAvatarStack"
export default AnswerersAvatarStack
