"use client"

import { Users } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { off, on, postEvent, type PopupButton } from "@tma.js/sdk"
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"

import Skeleton from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/common/UserAvatar"
const LottieObserver = lazy(() => import("./LottieObserver"))

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import { removeUserFromReportUsers } from "@/api/reports"
import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"

import styles from "../styles/title-waiting.module.scss"
import waitingStyles from "./waiting.module.scss"

interface UsersWaitingProps {
  users: {
    users: number[]
    observers: number[]
  }
  tgId: number
  reportId: number
  lastByType: LastSocketEventByType<QuizEvent>
  /** Ведущий (владелец отчёта) — только ему доступно исключение игроков из списка. */
  isLeader: boolean
}

function UsersWaiting({ users: initialUsers = { users: [], observers: [] }, tgId, reportId, lastByType, isLeader }: UsersWaitingProps) {
  const usersSource = initialUsers ?? { users: [], observers: [] }

  const { users = [], observers = [] } = usersSource

  const totalUsersRaw = [
    ...users.map((user) => ({ user, type: "user" as const })),
    ...observers.map((observer) => ({ user: observer, type: "observer" as const })),
  ]

  const uniqueByTelegramId = new Map<number, { user: number; type: "user" | "observer" }>()
  for (const item of totalUsersRaw) {
    // При дублях приоритет у "user", чтобы не затирать участника наблюдателем.
    const prev = uniqueByTelegramId.get(item.user)
    if (!prev || (prev.type === "observer" && item.type === "user")) {
      uniqueByTelegramId.set(item.user, item)
    }
  }

  const totalUsers = [...uniqueByTelegramId.values()].filter((item) => !(isLeader && item.user === tgId)).sort((a, b) => a.user - b.user)

  return (
    <section
      className="relative min-h-0 w-full max-w-screen flex-1 py-2"
      aria-label={users.length ? `Игроки: ${users.length}` : undefined}
    >
      {totalUsers.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--accent-orb)/25 bg-(--accent-orb)/6 px-4 py-10 text-center">
          <Users className="size-10 text-white/25" aria-hidden />
          <p
            className={cn("text-sm", waitingStyles.emptyHint)}
            data-text="Пока никто не подключился. Отправьте ссылку на квиз участникам."
          >
            Пока никто не подключился. Отправьте ссылку на квиз участникам.
          </p>
        </div>
      ) : (
        <CenterPlayerGrid users={totalUsers} tgId={tgId} reportId={reportId} isLeader={isLeader} lastByType={lastByType} />
      )}
    </section>
  )
}

UsersWaiting.displayName = "UsersWaiting"
export default UsersWaiting

interface IProps {
  users: { user: number; type: "user" | "observer" }[]
  tgId: number
  reportId: number
  isLeader: boolean
  lastByType: LastSocketEventByType<QuizEvent>
}

function parseUserProfileUpdatedPayload(msg: Record<string, unknown>) {
  const telegramRaw = msg.telegram_id ?? (msg.data as Record<string, unknown> | undefined)?.telegram_id
  const reportRaw = msg.report_id ?? (msg.data as Record<string, unknown> | undefined)?.report_id
  const telegramId = typeof telegramRaw === "number" ? telegramRaw : typeof telegramRaw === "string" ? Number(telegramRaw) : NaN
  return Number.isFinite(telegramId) && reportRaw != null ? { telegramId, reportId: reportRaw } : null
}

function CenterPlayerGrid({ users, tgId, reportId, isLeader, lastByType }: IProps) {
  const queryClient = useQueryClient()
  const [highlightedTelegramId, setHighlightedTelegramId] = useState<number | null>(null)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playersCount = users.filter((item) => item.type === "user").length

  const focusUserCard = useCallback((telegramId: number) => {
    setHighlightedTelegramId(telegramId)
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    clearTimerRef.current = setTimeout(() => setHighlightedTelegramId(null), 3500)

    if (typeof document === "undefined") return
    const cardEl = document.querySelector<HTMLElement>(`[data-user-card="${telegramId}"]`)
    cardEl?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [])

  useSocketEventEffect(
    lastByType,
    "user-profile-updated",
    (event) => {
      const parsed = parseUserProfileUpdatedPayload(event as Record<string, unknown>)
      if (!parsed) return
      if (String(parsed.reportId) !== String(reportId)) return

      const tid = parsed.telegramId

      focusUserCard(tid)

      queryClient.invalidateQueries({
        predicate: (q) => {
          const key = q.queryKey
          if (key[0] !== "user" || key.length < 2) return false
          return String(key[1]) === String(tid)
        },
      })
    },
    [focusUserCard, queryClient, reportId],
  )

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    }
  }, [])

  useEffect(() => {
    function handlePopupClosed(event: { button_id?: string }) {
      const buttonId = (event.button_id as string) ?? ""
      if (!buttonId.startsWith("remove_report_user|")) return
      const parts = buttonId.split("|")
      if (parts.length !== 3) return
      const [, rid, targetRaw] = parts
      if (String(rid) !== String(reportId)) return
      const targetTg = Number(targetRaw)
      if (!Number.isFinite(targetTg)) return

      void removeUserFromReportUsers(reportId, targetTg).catch((e) => {
        console.error(e)
      })
    }

    on("popup_closed", handlePopupClosed)
    return () => off("popup_closed", handlePopupClosed)
  }, [tgId, reportId, queryClient])

  return (
    <div
      className={cn("relative w-full after:leading-none after:text-white/6 after:tabular-nums after:select-none", styles.wrapper)}
      style={{ "--num": playersCount }}
    >
      <div className="relative z-10 grid min-h-60 w-full grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-3">
        {users.map((item) => (
          <UserWaiting
            key={`${item.type}-${item.user}`}
            user={item.user}
            tgId={tgId}
            reportId={reportId}
            isLeader={isLeader}
            type={item.type}
            highlighted={highlightedTelegramId === item.user}
          />
        ))}
      </div>
    </div>
  )
}

function UserWaiting({
  user,
  tgId,
  reportId,
  isLeader,
  type,
  highlighted,
}: {
  user: number
  tgId: number
  reportId: number
  isLeader: boolean
  type: "user" | "observer"
  highlighted: boolean
}) {
  const { data, isLoading } = useUserByTgId(user, { enabled: !!user && !!tgId })

  const bg = data?.bg
  const isObserver = type === "observer"
  const shouldPulse = highlighted && !isObserver ? highlighted : highlighted
  const avatarClass = shouldPulse
    ? "border-(--accent-orb) ring-2 ring-(--accent-orb)/30 animate-pulse"
    : isObserver
      ? "border-white/25"
      : "border-(--accent-orb)/35"
  const canRemoveFromReport = isLeader

  function openRemoveUserPopup() {
    if (!canRemoveFromReport || !reportId) return
    const pseudoLabel = data?.pseudo?.trim() || `Участник ${user}`
    const buttons: PopupButton[] = [
      { id: "cancel_remove_report_user", type: "cancel" },
      {
        id: `remove_report_user|${reportId}|${user}`,
        text: "Исключить",
        type: "destructive",
      },
    ]
    postEvent("web_app_open_popup", {
      title: "Исключить из игроков?",
      message: `Убрать «${pseudoLabel}» из списка игроков в этом отчёте?`,
      buttons,
    })
  }

  return (
    <div
      data-user-card={user}
      className={cn(
        "flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 outline-none",
        canRemoveFromReport && !isLoading && "cursor-pointer",
      )}
      title={canRemoveFromReport && !isLoading ? `${data?.pseudo ?? ""} — нажмите, чтобы исключить из игроков` : (data?.pseudo ?? "")}
      aria-label={data?.pseudo ?? ""}
      role={canRemoveFromReport ? "button" : undefined}
      tabIndex={canRemoveFromReport && !isLoading ? 0 : undefined}
      onClick={canRemoveFromReport && !isLoading ? openRemoveUserPopup : undefined}
    >
      {isLoading ? (
        <>
          <Skeleton className="size-12 rounded-full sm:size-13 md:size-14 lg:size-15" />
          <Skeleton className="h-3 w-full rounded-md" />
        </>
      ) : (
        <>
          <div className="relative">
            {isObserver && (
              <Suspense fallback={null}>
                <LottieObserver />
              </Suspense>
            )}
            <UserAvatar
              variant="waiting"
              bare
              avatar={data?.avatar}
              bg={bg}
              pseudo={data?.pseudo ?? ""}
              photoUrl={data?.photo_url}
              element={data?.element}
              className={avatarClass}
            />
          </div>
          <p className={cn("max-w-16 truncate text-[0.65rem] leading-none sm:max-w-20", isObserver ? "text-white/55" : "text-white/90")}>
            {data?.pseudo ?? ""}
          </p>
        </>
      )}
    </div>
  )
}
