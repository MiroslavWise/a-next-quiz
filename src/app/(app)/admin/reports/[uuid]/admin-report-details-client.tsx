"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, FileBarChart, Play, Trash, Trophy, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { off, on, postEvent, type PopupButton } from "@tma.js/sdk"

import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import { ItemGroup } from "@/components/ui/item"
import ItemUserReportPoints from "@/components/report/ItemUser"
import ReportQuestionStatsSection from "@/components/report/ReportQuestionStatsSection"

import { cn } from "@/lib/utils"
import { useAuthJwtClaims } from "@/lib/jwt"
import { EReportStatus } from "@/enum/report"
import { formatDateTimeHHmmDDMMYY } from "@/lib/date"
import { randomPrizeWinnerIds } from "@/lib/report-prizes"
import { deleteReport, getReportById, getReportUserPoints, reportUserTotalPoints, type IReportUserPoints } from "@/api/reports"
import { useReportPrizesUsers } from "@/components/start/hooks/use-report-prizes-users"

const STATUS_LABEL: Record<EReportStatus, string> = {
  [EReportStatus.WAITING]: "Ожидание",
  [EReportStatus.CHECKING]: "Проверка",
  [EReportStatus.START]: "Старт",
  [EReportStatus.GAME]: "Игра",
  [EReportStatus.END]: "Завершён",
}

function statusTone(status?: EReportStatus) {
  if (status === EReportStatus.END) return "border-black/70 bg-white/10 text-white/80"
  if (status === EReportStatus.GAME || status === EReportStatus.START) {
    return "border-black/70 bg-(--accent-orb)/20 text-(--accent-orb)"
  }
  if (status === EReportStatus.CHECKING) return "border-black/70 bg-amber-500/20 text-amber-100"
  return "border-black/70 bg-black/35 text-white/70"
}

function ReportDetailsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4" aria-busy="true" aria-label="Загрузка отчёта">
      <header className="flex items-center gap-2">
        <Skeleton className="size-9 shrink-0 rounded-lg border-2 border-black/60" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-40 rounded-md bg-white/12" />
          <Skeleton className="h-3.5 w-24 rounded-md bg-white/8" />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-lg border-2 border-black/60" />
      </header>
      <Skeleton className="aspect-[2.2/1] w-full rounded-lg border-2 border-black/60" />
      <div className="grid grid-cols-2 gap-2.5">
        <Skeleton className="h-16 rounded-lg border-2 border-black/60" />
        <Skeleton className="h-16 rounded-lg border-2 border-black/60" />
      </div>
      <div className="space-y-3 pt-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`report-user-skeleton-${index}`} className="h-16 w-full rounded-lg border-2 border-black/60" />
        ))}
      </div>
    </div>
  )
}

export default function AdminReportDetailsClient({ uuid }: { uuid: string }) {
  const router = useRouter()
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id

  const { data: userPoints, isLoading: isLoadingUserPoints } = useQuery({
    queryKey: ["report-user-points", uuid],
    enabled: !!uuid && !!tgId,
    queryFn: () => getReportUserPoints(uuid),
  })
  const { data: report, isLoading: isLoadingReport } = useQuery({
    queryKey: ["report", uuid],
    enabled: !!uuid && !!tgId,
    queryFn: () => getReportById(uuid),
  })

  const canGoToGame =
    !!report && report.user_id === tgId && [EReportStatus.WAITING, EReportStatus.START, EReportStatus.GAME].includes(report.status)

  const prizes = report?.prizes ?? []
  const quiz = report?.quiz
  const coverUrl = quiz?.imageUrl ?? quiz?.image_url ?? null
  const quizName = quiz?.name?.trim() || "Квиз"
  const reportIdLabel = report?.id != null ? String(report.id) : uuid

  const { data: winners } = useReportPrizesUsers({
    reportId: uuid,
    enabled: !!uuid && report?.status === EReportStatus.END,
  })
  const randomWinners = useMemo(() => randomPrizeWinnerIds(winners), [winners])

  const sortedUserPoints = useMemo(() => {
    if (!userPoints?.length) return []
    return userPoints
      .toSorted((a, b) => reportUserTotalPoints(b) - reportUserTotalPoints(a))
      .map((item, index) => ({ ...item, rank: item.rank ?? index + 1 }))
  }, [userPoints])

  const prizePlacesLabel = useMemo(() => {
    if (prizes.length === 0) return null
    return prizes
      .toSorted((a, b) => a - b)
      .map((place) => `${place}`)
      .join(" · ")
  }, [prizes])

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
      message: "Вы уверены, что хотите удалить отчёт «" + quizName + "»?",
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

  if (isLoadingUserPoints || isLoadingReport) return <ReportDetailsSkeleton />

  return (
    <div className="flex w-full flex-col gap-4">
      <header className="game-liquid flex items-start gap-2 rounded-lg p-3 sm:p-3.5">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="mt-0.5 size-9 shrink-0 rounded-lg border-2 border-black/80 bg-black/35 text-white shadow-[3px_3px_0_0_#0a0c0b]"
          aria-label="К списку отчётов"
        >
          <Link href="/admin/reports">
            <ArrowLeft className="size-3.5" />
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.65rem] font-bold tracking-[0.18em] text-(--accent-orb) uppercase">Отчёт #{reportIdLabel}</p>
            {report?.status ? (
              <span
                className={cn(
                  "rounded-md border-2 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide shadow-[1px_1px_0_0_#0a0c0b]",
                  statusTone(report.status),
                )}
              >
                {STATUS_LABEL[report.status] ?? report.status}
              </span>
            ) : null}
          </div>
          <h1 className="mt-1 text-xl leading-tight font-bold text-balance text-white">{quizName}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-white/45">
            {report?.created_at ? <span>{formatDateTimeHHmmDDMMYY(report.created_at)}</span> : null}
            {report?.code ? (
              <>
                <span aria-hidden className="text-white/20">
                  ·
                </span>
                <span className="font-mono tracking-wider text-white/55">{report.code}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
          {canGoToGame ? (
            <Button
              asChild
              size="icon"
              className="game-btn-primary size-9 rounded-lg"
              aria-label="Открыть игру"
            >
              <Link href={`/start/${report.id}`}>
                <Play className="size-3.5" />
              </Link>
            </Button>
          ) : null}
          <Button
            size="icon"
            className="size-9 rounded-lg border-2 border-black/80 bg-(--unfaithful)/85 text-white shadow-[3px_3px_0_0_#0a0c0b]"
            aria-label="Удалить отчёт"
            onClick={handleDeleteQuiz}
          >
            <Trash className="size-3.5" />
          </Button>
        </div>
      </header>

      {coverUrl ? (
        <div className="relative aspect-[2.2/1] overflow-hidden rounded-lg border-2 border-black/80 bg-black/35 shadow-[4px_4px_0_0_#0a0c0b]">
          <Image
            src={coverUrl}
            alt={`Обложка: ${quizName}`}
            fill
            sizes="(max-width: 1024px) 100vw, 64rem"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="game-slab flex aspect-[2.8/1] items-center justify-center rounded-lg border-dashed">
          <FileBarChart className="size-8 text-white/25" aria-hidden />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div className="game-slab rounded-lg px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.14em] text-white/45 uppercase">
            <Users className="size-3" aria-hidden />
            Игроки
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">{sortedUserPoints.length}</p>
        </div>
        <div className="game-slab rounded-lg px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.14em] text-white/45 uppercase">
            <Trophy className="size-3" aria-hidden />
            Призы
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">{prizePlacesLabel ?? "—"}</p>
          {prizePlacesLabel ? <p className="mt-0.5 text-[0.65rem] text-white/40">места</p> : null}
        </div>
      </div>

      <ReportQuestionStatsSection
        reportId={uuid}
        tgId={tgId}
        enabled={!!tgId && (report?.status === EReportStatus.END || report?.status === EReportStatus.GAME)}
      />

      <section className="game-liquid overflow-visible rounded-lg p-3.5 sm:p-4">
        <header className="mb-3 flex items-end justify-between gap-3 px-0.5">
          <div>
            <h2 className="text-base font-bold text-white">Таблица очков</h2>
            <p className="mt-0.5 text-xs text-white/45">Нажмите строку, чтобы раскрыть детализацию</p>
          </div>
        </header>

        {sortedUserPoints.length > 0 ? (
          <ItemGroup className="space-y-4 overflow-visible pt-3">
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
                  gameTone
                />
              )
            })}
          </ItemGroup>
        ) : (
          <div className="game-slab flex flex-col items-center gap-2 rounded-lg border-dashed px-4 py-10 text-center">
            <Users className="size-6 text-white/30" aria-hidden />
            <p className="text-sm font-bold text-white/80">Нет данных по очкам</p>
            <p className="max-w-xs text-xs text-white/45">Когда игроки наберут баллы, рейтинг появится здесь.</p>
          </div>
        )}
      </section>
    </div>
  )
}
