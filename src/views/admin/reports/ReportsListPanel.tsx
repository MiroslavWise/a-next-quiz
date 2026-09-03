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
      <ItemGroup className="gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index + "skeleton"} className="flex w-full items-center gap-4">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </ItemGroup>
    )
  }

  if (reports && reports.length > 0) {
    return (
      <ItemGroup className="gap-2">
        {reports.map((report) => (
          <Item key={report.id} variant="outline" asChild role="listitem" className="bg-background w-full">
            <Link href={`/admin/reports/${report.id}`}>
              {report.quiz?.imageUrl ? (
                <ItemMedia variant="image">
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
                  <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                    <FileBarChart className="text-muted-foreground size-4" />
                  </div>
                </ItemMedia>
              )}
              <ItemContent>
                <ItemTitle className="line-clamp-1 truncate">Отчёт #{report?.id}</ItemTitle>
                <ItemDescription className="font-mono text-xs">{report?.quiz?.name}</ItemDescription>
                <ItemSeparator />
                <ItemFooter className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <span className="text-foreground text-xs font-medium">{report?.status}</span>
                  <span className="text-muted-foreground text-xs">{formatDateTimeHHmmDDMMYY(report.created_at)}</span>
                </ItemFooter>
              </ItemContent>
            </Link>
          </Item>
        ))}
      </ItemGroup>
    )
  }

  return (
    <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed p-3 text-center">
      <div className="border-border bg-muted/60 flex size-10 items-center justify-center rounded-full border">
        <FileBarChart className="text-muted-foreground size-4" />
      </div>
      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">Отчётов пока нет</p>
        <p className="text-muted-foreground text-xs">Когда появятся данные с сервера, они отобразятся здесь.</p>
      </div>
      <Button asChild variant="outline" aria-label="К списку квизов">
        <Link href="/admin">К списку квизов</Link>
      </Button>
    </div>
  )
}
