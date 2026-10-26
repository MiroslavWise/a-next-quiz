"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { FileBarChart } from "lucide-react"

import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import { Item, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"

import { getReports } from "@/api/reports"
import { useAuthJwtClaims } from "@/lib/jwt"
import { formatDateTimeHHmmDDMMYY } from "@/lib/date"

/** Список отчётов (react-query). */
export default function ReportsListPanel() {
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports"],
    enabled: !!tgId,
    queryFn: getReports,
    refetchOnMount: true,
  })

  if (isLoading) {
    return (
      <ItemGroup className="gap-2.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index + "skeleton"} className="game-slab flex w-full items-center gap-3 rounded-lg p-3">
            <Skeleton className="size-10 shrink-0 rounded-md border-2 border-black/60" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-4 w-full bg-white/12" />
              <Skeleton className="h-4 w-3/4 bg-white/8" />
            </div>
          </div>
        ))}
      </ItemGroup>
    )
  }

  if (reports && reports.length > 0) {
    return (
      <ItemGroup className="gap-2.5">
        {reports.map((report) => (
          <Item
            key={report.id}
            variant="outline"
            asChild
            role="listitem"
            className="game-slab w-full rounded-lg border-2 border-black/80 bg-transparent text-white shadow-[4px_4px_0_0_#0a0c0b] [a]:hover:bg-white/5"
          >
            <Link href={`/admin/reports/${report.id}`}>
              {report.quiz?.imageUrl ? (
                <ItemMedia variant="image" className="rounded-md border-2 border-black/70 shadow-[2px_2px_0_0_#0a0c0b]">
                  <img
                    src={report.quiz.imageUrl}
                    alt={report.quiz.name}
                    className="size-8 object-cover"
                    width={32}
                    height={32}
                    loading="lazy"
                  />
                </ItemMedia>
              ) : (
                <ItemMedia variant="image">
                  <div className="flex size-8 items-center justify-center rounded-md border-2 border-black/70 bg-black/40 shadow-[2px_2px_0_0_#0a0c0b]">
                    <FileBarChart className="size-4 text-white/55" />
                  </div>
                </ItemMedia>
              )}
              <ItemContent>
                <ItemTitle className="line-clamp-1 truncate text-white">Отчёт #{report?.id}</ItemTitle>
                <ItemDescription className="font-mono text-xs text-white/55">{report?.quiz?.name}</ItemDescription>
                <ItemSeparator className="bg-white/10" />
                <ItemFooter className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <span className="rounded-md border-2 border-black/70 bg-(--accent-orb)/15 px-1.5 py-0.5 text-[0.65rem] font-bold text-(--accent-orb) shadow-[1px_1px_0_0_#0a0c0b]">
                    {report?.status}
                  </span>
                  <span className="text-xs text-white/45">{formatDateTimeHHmmDDMMYY(report.created_at)}</span>
                </ItemFooter>
              </ItemContent>
            </Link>
          </Item>
        ))}
      </ItemGroup>
    )
  }

  return (
    <div className="game-slab flex flex-col items-center gap-3 rounded-lg border-dashed p-4 text-center">
      <div className="flex size-10 items-center justify-center rounded-md border-2 border-black/70 bg-black/35 shadow-[2px_2px_0_0_#0a0c0b]">
        <FileBarChart className="size-4 text-white/45" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-white">Отчётов пока нет</p>
        <p className="text-xs text-white/55">Когда появятся данные с сервера, они отобразятся здесь.</p>
      </div>
      <Button asChild className="game-btn-primary h-10 rounded-lg font-bold" aria-label="К списку квизов">
        <Link href="/admin">К списку квизов</Link>
      </Button>
    </div>
  )
}
