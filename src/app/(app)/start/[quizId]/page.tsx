"use client"

import { useRouter, useParams } from "next/navigation"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState, Suspense, lazy, memo, type PropsWithChildren } from "react"

import Spinner from "@/components/ui/spinner"
const StatusEnd = lazy(() => import("@/components/start/end"))
const StatusWaiting = lazy(() => import("@/components/start/waiting"))
const ActiveQuestions = lazy(() => import("@/components/start/active"))
const StatusStart = memo(lazy(() => import("@/components/start/StatusStart")))
const StatusChecking = lazy(() => import("@/components/start/checking"))

import { cn } from "@/lib/utils"
import { useAuthJwtClaims } from "@/lib/jwt"
import { getRepostById } from "@/api/reports"
import { reportPrizesUsersQueryKey } from "@/components/start/hooks/use-report-prizes-users"
import {
  parseUserRemovedPayload,
  USER_REMOVED_REASON_NO_ANSWERS_START,
} from "@/components/start/lib/socket-payloads"
import { EReportStatus } from "@/enum/report"
import { useSocketEventEffect } from "@/hooks/socket-event-by-type"
import { useQuizSocketIO } from "@/hooks/useQuizSocketIO"
import { setElementThemeSessionIsGameAvatar } from "@/stores/element-theme-session"
import { showToast } from "@/stores/toast"
import { WithSocketConnectionIndicator } from "@/components/start/SocketConnectionIndicator"

export default function StartQuizIndex() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id
  const isAdminManager = !!(claims?.is_admin || claims?.is_manager)
  const params = useParams() as Record<string, string | string[] | undefined>
  const quizId = typeof params.quizId === "string" ? params.quizId : Array.isArray(params.quizId) ? params.quizId[0] : undefined

  /** Меняется при событиях сокета / переподключении — новый ключ запускает повторную загрузку отчёта без `refetch()` в эффектах. */
  const [reportSyncKey, setReportSyncKey] = useState(0)
  const bumpReportQuery = () => setReportSyncKey((k) => k + 1)

  const { data, isLoading } = useQuery({
    enabled: !!quizId && !!tgId,
    queryKey: ["report", quizId, tgId, reportSyncKey],
    queryFn: () => getRepostById(quizId!),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const socketEnabled = data?.status !== EReportStatus.END
  const prizes = data?.prizes ?? []

  const { lastMessage, lastByType, isConnected, connectSeq } = useQuizSocketIO({
    reportId: quizId!,
    enabled: socketEnabled,
  })

  useSocketEventEffect(
    lastByType,
    "start",
    (msg) => {
      if (!data) return
      const { status } = msg
      if (!status) return
      if (status === EReportStatus.CHECKING && data.status !== EReportStatus.CHECKING) {
        bumpReportQuery()
      }
    },
    [data],
  )

  useSocketEventEffect(
    lastByType,
    "start",
    (msg) => {
      const { status } = msg
      if (status === EReportStatus.START) {
        bumpReportQuery()
        void queryClient.invalidateQueries({ queryKey: ["report-users"] })
        return
      }
      if (status === EReportStatus.GAME) {
        bumpReportQuery()
        if (quizId) {
          void queryClient.invalidateQueries({ queryKey: ["active-questions", quizId], exact: true })
        }
      }
    },
    [queryClient, quizId],
  )

  useSocketEventEffect(
    lastByType,
    "end",
    (msg) => {
      if (msg.status === EReportStatus.START) {
        bumpReportQuery()
        void queryClient.invalidateQueries({ queryKey: ["report-users"] })
        return
      }
      if (msg.status === EReportStatus.GAME) {
        bumpReportQuery()
      }
    },
    [queryClient],
  )

  useSocketEventEffect(
    lastByType,
    "end-game",
    (msg) => {
      if (msg.status === EReportStatus.START) {
        bumpReportQuery()
        void queryClient.invalidateQueries({ queryKey: ["report-users"] })
        return
      }
      if (msg.status === EReportStatus.END) {
        bumpReportQuery()
        if (quizId) {
          void queryClient.invalidateQueries({ queryKey: reportPrizesUsersQueryKey(quizId) })
        }
      }
    },
    [queryClient, quizId],
  )

  /**
   * Исключение из `report.users` (`user-removed`, docs/API.md):
   * обновляем состав; себя уводим на главную; при автокике `no_answers_start` — toast с причиной.
   */
  useSocketEventEffect(
    lastByType,
    "user-removed",
    (msg) => {
      const removed = parseUserRemovedPayload(msg as Record<string, unknown>)
      if (!removed) return

      void queryClient.invalidateQueries({ queryKey: ["report-users"] })

      if (tgId && removed.telegramId === tgId) {
        if (removed.reason === USER_REMOVED_REASON_NO_ANSWERS_START) {
          showToast("Вас исключили: нет ответов на первые 3 вопроса", 5000)
        }
        router.replace("/")
      }
    },
    [tgId, quizId, router, queryClient],
  )

  const didInitialSocketConnectRef = useRef(false)

  useEffect(() => {
    if (connectSeq <= 0) return

    if (!didInitialSocketConnectRef.current) {
      didInitialSocketConnectRef.current = true
      return
    }

    setReportSyncKey((k) => k + 1)
  }, [connectSeq])

  useEffect(() => {
    if (tgId == null || data?.element_avatar_id == null) {
      setElementThemeSessionIsGameAvatar(false)
      return
    }

    setElementThemeSessionIsGameAvatar(Number(data.element_avatar_id) === Number(tgId))
    return () => setElementThemeSessionIsGameAvatar(false)
  }, [tgId, data?.element_avatar_id])

  if (isLoading && !data)
    return (
      <div className="flex h-full w-full items-center justify-center px-4">
        <Spinner className="size-10" />
      </div>
    )

  const { status } = data ?? {}
  const phaseKey = status ? gamePhaseKey(status) : null

  if (data && phaseKey) {
    const phaseContent = (
      <div
        key={phaseKey}
        className={
          phaseKey === "game"
            ? cn(
                "flex h-full min-h-0 w-full flex-col overflow-y-auto",
                // У staff место под fixed-кнопку — spacer в ActiveQuestions (`.spacer-bottom-next`).
                !isAdminManager && "pb-12",
              )
            : "h-full w-full"
        }
      >
          {status === EReportStatus.WAITING ? (
            <ComponentSuspenseLoader>
              <StatusWaiting tgId={tgId!} data={data} lastByType={lastByType} />
            </ComponentSuspenseLoader>
          ) : status === EReportStatus.CHECKING ? (
            <ComponentSuspenseLoader>
              <StatusChecking tgId={tgId!} data={data} lastByType={lastByType} />
            </ComponentSuspenseLoader>
          ) : status === EReportStatus.START ? (
            <ComponentSuspenseLoader>
              <StatusStart refetch={bumpReportQuery} />
            </ComponentSuspenseLoader>
          ) : status === EReportStatus.GAME ? (
            <ComponentSuspenseLoader>
              <ActiveQuestions
                reportId={quizId!}
                tgId={tgId!}
                user_id={data.user_id!}
                lastByType={lastByType}
                questions={data.questions! || []}
                status={status}
                prizes={prizes}
                elementAvatarId={data.element_avatar_id ?? null}
              />
            </ComponentSuspenseLoader>
          ) : (
            <ComponentSuspenseLoader>
              <StatusEnd data={data} tgId={tgId!} />
            </ComponentSuspenseLoader>
          )}
        </div>
    )

    if (status === EReportStatus.END) return phaseContent

    return <WithSocketConnectionIndicator isConnected={isConnected}>{phaseContent}</WithSocketConnectionIndicator>
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-12">
      <div className="flex h-full w-full flex-col gap-2">
        <p>Игра завершена</p>
        <pre>{JSON.stringify(lastMessage, null, 2)}</pre>
      </div>
    </div>
  )
}

function gamePhaseKey(status: EReportStatus): string | null {
  switch (status) {
    case EReportStatus.WAITING:
      return "waiting"
    case EReportStatus.CHECKING:
      return "checking"
    case EReportStatus.START:
      return "start"
    case EReportStatus.GAME:
      return "game"
    case EReportStatus.END:
      return "end"
    default:
      return null
  }
}

function ComponentSuspenseLoader({ children }: PropsWithChildren) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center px-4">
          <Spinner className="size-10" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
