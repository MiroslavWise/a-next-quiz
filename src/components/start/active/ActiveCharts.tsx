"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import Skeleton from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"
import { getReportsAnswersCorrect, type IReportAnswersCorrect } from "@/api/reports"

interface IProps {
  reportId: string
  tgId: number
  index: number
  /** Подсветить строку исхода этого игрока. Ведущему не нужно. */
  highlightOwn?: boolean
}

type Outcome = "right" | "wrong" | "skip"

const ROWS: { id: Outcome; label: string; dotClass: string }[] = [
  { id: "right", label: "Верно", dotClass: "bg-(--faithful)" },
  { id: "wrong", label: "Неверно", dotClass: "bg-(--unfaithful)" },
  { id: "skip", label: "Пропуск", dotClass: "bg-white/35" },
]

function bucketCount(data: { count?: number } | undefined) {
  return data?.count ?? 0
}

/** Сначала верно, потом неверно, пропуск забирает остаток до 100. */
function sharePercents(right: number, wrong: number, total: number) {
  if (total <= 0) return { right: 0, wrong: 0, skip: 0 }
  const rightPct = Math.floor((right * 100) / total)
  const wrongPct = Math.floor((wrong * 100) / total)
  return { right: rightPct, wrong: wrongPct, skip: 100 - rightPct - wrongPct }
}

function ownOutcome(data: IReportAnswersCorrect, tgId: number): Outcome | null {
  const inBucket = (users: { telegram_id: number }[] | undefined) => users?.some((user) => user.telegram_id === tgId) ?? false
  if (inBucket(data.right?.users)) return "right"
  if (inBucket(data.wrong?.users)) return "wrong"
  if (inBucket(data.abstained?.users)) return "skip"
  return null
}

function ActiveCharts({ reportId, tgId, index, highlightOwn = false }: IProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["active-charts", reportId, index],
    queryFn: () => getReportsAnswersCorrect(reportId, index),
    enabled: !!reportId && !!tgId,
  })

  const right = bucketCount(data?.right)
  const wrong = bucketCount(data?.wrong)
  const skip = bucketCount(data?.abstained)
  const total = data?.participants_total ?? right + wrong + skip
  const percents = sharePercents(right, wrong, total)
  const counts = { right, wrong, skip }
  const mine = highlightOwn && data ? ownOutcome(data, tgId) : null
  const empty = !isLoading && total <= 0

  const [drawn, setDrawn] = useState(false)
  useEffect(() => {
    if (isLoading) return
    const frame = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(frame)
  }, [isLoading, right, wrong, skip])

  const segments = (
    [
      { id: "right" as const, count: right, className: "bg-(--faithful)" },
      { id: "wrong" as const, count: wrong, className: "bg-(--unfaithful)" },
      { id: "skip" as const, count: skip, className: "bg-white/35" },
    ] as const
  ).filter((segment) => segment.count > 0)

  return (
    <div className="glass-start-liquid-palette w-full rounded-2xl px-4 py-3.5 shadow-none">
      {isLoading ? (
        <ActiveChartsBodySkeleton />
      ) : empty ? (
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full rounded-full bg-white/15" />
          <p className="text-sm text-white/60">Никто не в зале</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label={`Верно ${right}, неверно ${wrong}, пропуск ${skip}`}
          >
            {segments.map((segment) => (
              <div
                key={segment.id}
                className={cn("h-full transition-[width] duration-[400ms] ease-out", segment.className)}
                style={{ width: drawn ? `${(segment.count / total) * 100}%` : "0%" }}
              />
            ))}
          </div>
          <ul className="flex flex-col gap-1.5">
            {ROWS.map((row) => {
              const active = mine === row.id
              return (
                <li
                  key={row.id}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    active ? "font-medium text-white" : "text-white/65",
                  )}
                >
                  <span className={cn("size-2 shrink-0 rounded-full", row.dotClass)} aria-hidden />
                  <span>{row.label}</span>
                  <span className="ml-auto tabular-nums">
                    {counts[row.id]} ({percents[row.id]}%)
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function ActiveChartsBodySkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="h-3 w-full rounded-full bg-white/10" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full rounded-md bg-white/10" />
        <Skeleton className="h-4 w-full rounded-md bg-white/10" />
        <Skeleton className="h-4 w-3/4 rounded-md bg-white/10" />
      </div>
    </div>
  )
}

ActiveCharts.displayName = "ActiveCharts"
export default ActiveCharts
