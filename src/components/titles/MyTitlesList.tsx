"use client"

import { useQuery } from "@tanstack/react-query"

import { getMyTitles } from "@/api/reports"
import { MatchTitleMark } from "@/components/report/MatchTitleChip"
import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import { MATCH_TITLE_CATALOG } from "@/content/match-titles"
import { cn } from "@/lib/utils"

function TitleCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/4 px-4 py-3">
      <Skeleton className="h-4 w-40 bg-white/10" />
      <Skeleton className="mt-2 h-3 w-full bg-white/6" />
      <Skeleton className="mt-1 h-3 w-4/5 bg-white/6" />
    </div>
  )
}

export default function MyTitlesList() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-titles"],
    queryFn: getMyTitles,
    staleTime: 1000 * 60,
    retry: 1,
  })

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-2" aria-busy="true" aria-label="Загрузка званий">
        {MATCH_TITLE_CATALOG.map((item) => (
          <li key={item.id}>
            <TitleCardSkeleton />
          </li>
        ))}
      </ul>
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/4 px-4 py-4" role="alert">
        <p className="text-sm text-white/80">Не удалось загрузить звания</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" disabled={isFetching} onClick={() => refetch()}>
          Повторить
        </Button>
      </div>
    )
  }

  const countById = new Map(data.map((item) => [item.id, item.count]))

  return (
    <ul className="flex flex-col gap-2" aria-label="Звания">
      {MATCH_TITLE_CATALOG.map((item) => {
        const count = countById.get(item.id) ?? 0
        const earned = count > 0
        const rare = Boolean(item.rare && earned)
        return (
          <li key={item.id}>
            <article
              aria-label={`${item.title}. Получено ${count}`}
              className={cn(
                "rounded-xl border px-4 py-3",
                earned
                  ? rare
                    ? "border-amber-200/70 bg-amber-900/40"
                    : "border-amber-500/35 bg-amber-950/25"
                  : "border-white/10 bg-white/4",
              )}
            >
              <div className="flex items-center gap-2">
                <MatchTitleMark id={item.id} className={cn("size-4", earned ? "text-amber-100" : "opacity-40")} />
                <h2 className={cn("min-w-0 text-sm font-semibold", earned ? "text-amber-200" : "text-white/45")}>{item.title}</h2>
                <span
                  className={cn(
                    "ml-auto shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums",
                    earned ? "border-amber-200/50 text-amber-50" : "border-white/10 text-white/35",
                  )}
                >
                  {count}
                </span>
              </div>
              <p className={cn("mt-1 text-xs leading-relaxed", earned ? "text-white/70" : "text-white/35")}>{item.detail}</p>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
