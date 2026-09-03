"use client"

import { useQuery } from "@tanstack/react-query"

import Spinner from "@/components/ui/spinner"

import { cn } from "@/lib/utils"
import { getReportsAnswersCorrect } from "@/api/reports"

import styles from "../styles/optimal.module.scss"

interface IProps {
  title?: string
  reportId: string
  tgId: number
  index: number
}

function bucketCount(data: { count?: number } | undefined): number {
  return data?.count ?? 0
}

function ActiveCharts({ reportId, tgId, index, title }: IProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["active-charts", reportId, index],
    queryFn: () => getReportsAnswersCorrect(reportId, index),
    enabled: !!reportId && !!tgId,
  })

  const right = bucketCount(data?.right)
  const wrong = bucketCount(data?.wrong)
  const abstained = bucketCount(data?.abstained)
  const total = data?.participants_total ?? right + wrong + abstained
  const rightPercent = total > 0 ? (right / total) * 100 : 0
  const wrongPercent = total > 0 ? (wrong / total) * 100 : 0
  const abstainedPercent = total > 0 ? (abstained / total) * 100 : 0
  const c1 = rightPercent
  const c2 = rightPercent + wrongPercent

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="glass-start-liquid-palette w-full rounded-2xl p-4 lg:p-6">
        {isLoading ? (
          <div className="flex min-h-36 items-center justify-center lg:min-h-44">
            <Spinner className="size-5 lg:size-6" />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 sm:gap-6 xl:mt-5 xl:gap-8">
            <div className="relative">
              <div
                className={cn("size-28 rounded-full border border-(--accent-orb)/40 lg:size-36 2xl:size-66", styles.conicGradient)}
                style={{
                  "--c1": `${c1}%`,
                  "--c2": `${c2}%`,
                }}
                aria-label="Круговая диаграмма ответов"
              />
              <div className="absolute inset-3 rounded-full bg-black/50 xl:inset-4" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-white/90 xl:text-sm">{total}</span>
              </div>
            </div>
            <ul className="w-full min-w-0 space-y-2 text-sm lg:text-base xl:space-y-2.5 2xl:text-xl">
              <li className="glass-start-slab-faithful flex items-center justify-between rounded-xl px-3 py-2 text-white/95 xl:px-4 xl:py-2.5">
                <span>Верно</span>
                <span className="font-semibold tabular-nums">
                  {right} ({rightPercent.toFixed(0)}%)
                </span>
              </li>
              <li className="glass-start-slab-unfaithful flex items-center justify-between rounded-xl px-3 py-2 text-white/95 xl:px-4 xl:py-2.5">
                <span>Не верно</span>
                <span className="font-semibold tabular-nums">
                  {wrong} ({wrongPercent.toFixed(0)}%)
                </span>
              </li>
              <li className="flex min-w-0 flex-col gap-1.5">
                <div className="glass-start-slab flex items-center justify-between rounded-xl px-3 py-2 text-white/95 xl:px-4 xl:py-2.5">
                  <span>Пропуск / воздержались</span>
                  <span className="font-semibold tabular-nums">
                    {abstained} ({abstainedPercent.toFixed(0)}%)
                  </span>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="glass-start-liquid-palette flex w-full items-center justify-center rounded-2xl p-4 lg:p-6">
        <p className="max-w-[90%] text-center text-base leading-relaxed font-medium text-balance whitespace-pre-wrap text-white xl:text-xl 2xl:text-2xl">
          {title ?? ""}
        </p>
      </div>
    </div>
  )
}

ActiveCharts.displayName = "ActiveCharts"
export default ActiveCharts
