"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Play, Trash } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { off, on, postEvent, type PopupButton } from "@tma.js/sdk"

import Button from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import { ItemGroup } from "@/components/ui/item"
import { Card, CardTitle } from "@/components/ui/card"
import ItemUserReportPoints from "@/components/report/ItemUser"

import { useAuthJwtClaims } from "@/lib/jwt"
import { EReportStatus } from "@/enum/report"
import { randomPrizeWinnerIds } from "@/lib/report-prizes"
import { deleteReport, getReportById, getReportUserPoints, reportUserTotalPoints, type IReportUserPoints } from "@/api/reports"
import { useReportPrizesUsers } from "@/components/start/hooks/use-report-prizes-users"

export default function AdminReportDetails() {
  const params = useParams() as Record<string, string | string[] | undefined>
  const uuid = typeof params.uuid === "string" ? params.uuid : Array.isArray(params.uuid) ? params.uuid[0] : undefined
  const router = useRouter()
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id

  const { data: userPoints, isLoading: isLoadingUserPoints } = useQuery({
    queryKey: ["report-user-points", uuid],
    enabled: !!uuid && !!tgId,
    queryFn: () => getReportUserPoints(uuid!),
  })
  const { data: report } = useQuery({
    queryKey: ["report", uuid],
    enabled: !!uuid && !!tgId,
    queryFn: () => getReportById(uuid!),
  })

  const canGoToGame =
    !!report && report.user_id === tgId && [EReportStatus.WAITING, EReportStatus.START, EReportStatus.GAME].includes(report.status)

  const prizes = report?.prizes ?? []

  const { data: winners } = useReportPrizesUsers({
    reportId: uuid!,
    enabled: !!uuid && report?.status === EReportStatus.END,
  })
  const randomWinners = useMemo(() => randomPrizeWinnerIds(winners), [winners])

  const sortedUserPoints = userPoints
    ? userPoints
        .toSorted((a, b) => reportUserTotalPoints(b) - reportUserTotalPoints(a))
        .map((item, index) => ({ ...item, rank: item.rank ?? index + 1 }))
    : []

  function handleDeleteQuiz() {
    const buttons: PopupButton[] = [
      {
        id: "delete_report" + "|" + uuid,
        text: "Удалить",
        type: "destructive",
      },
      {
        id: "cancel",
        type: "cancel",
      },
    ]

    postEvent("web_app_open_popup", {
      title: "Удалить отчёт?",
      message: "Вы уверены, что хотите удалить отчёт «" + report?.quiz?.name + "»?",
      buttons: buttons,
    })
  }

  async function handleDelete(str: string) {
    const [action, deleteId] = str.split("|")
    if (action === "delete_report") {
      try {
        await deleteReport(deleteId)
        router.replace("/admin/reports")
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    if (!tgId) return

    function handlePopupClosed(event: { button_id?: string }) {
      const buttonId = (event.button_id as string) ?? ""
      if (buttonId.includes("delete_report") && buttonId.includes("|")) return handleDelete(buttonId)
    }

    on("popup_closed", handlePopupClosed)

    return () => {
      off("popup_closed", handlePopupClosed)
    }
  }, [tgId])

  if (isLoadingUserPoints)
    return (
      <Card className="w-full space-y-4">
        <div className="flex h-full min-h-50 w-full items-center justify-center">
          <Spinner />
        </div>
      </Card>
    )

  return (
    <div className="flex h-full w-full flex-col pt-5">
      <header className="flex w-full flex-row items-center justify-between gap-2 py-4">
        <Button asChild variant="outline" size="icon" aria-label="К списку отчётов">
          <Link href="/admin/reports">
            <ArrowLeft className="size-3.5" />
          </Link>
        </Button>
        <div className="flex w-full min-w-0 flex-col">
          <CardTitle className="truncate">Отчёт {uuid}</CardTitle>
        </div>
        <div className="flex flex-row items-center justify-end gap-2">
          {canGoToGame ? (
            <Button asChild variant="secondary">
              <Link href={`/start/${report.id}`}>
                <Play className="size-3.5" />
              </Link>
            </Button>
          ) : null}
          <Button variant="destructive" size="icon" aria-label="Удалить" onClick={handleDeleteQuiz}>
            <Trash className="size-3.5" />
          </Button>
        </div>
      </header>
      <div className="py-6">
        <Card className="space-y-3 p-4">
          <CardTitle className="text-base">Очки пользователей</CardTitle>
          {prizes.length > 0 ? (
            <p className="text-muted-foreground text-xs">
              Призовые места:{" "}
              <span className="font-semibold text-amber-600 dark:text-amber-300">
                {prizes
                  .toSorted((a, b) => a - b)
                  .map((place) => `${place} место`)
                  .join(", ")}
              </span>
            </p>
          ) : null}
          {isLoadingUserPoints ? (
            <div className="flex min-h-30 w-full items-center justify-center">
              <Spinner />
            </div>
          ) : sortedUserPoints.length > 0 ? (
            <ItemGroup className={prizes.length > 0 ? "space-y-3 pt-1 pl-1" : "space-y-2"}>
              {sortedUserPoints.map((item: IReportUserPoints & { rank: number }) => {
                const isPrizePlace = item.rank > 0 && prizes.includes(item.rank)
                return (
                  <ItemUserReportPoints
                    key={item.telegram_id}
                    {...item}
                    rank={item.rank}
                    tgId={tgId!}
                    reportId={uuid}
                    points={reportUserTotalPoints(item)}
                    isPrizePlace={isPrizePlace}
                    isRandomPrize={randomWinners.has(Number(item.telegram_id))}
                  />
                )
              })}
            </ItemGroup>
          ) : (
            <p className="text-muted-foreground text-sm">Нет данных по очкам</p>
          )}
        </Card>
      </div>
    </div>
  )
}
