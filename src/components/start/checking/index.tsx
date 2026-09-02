"use client"

import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle2, Loader2, ShieldCheck, Timer, UserRoundCheck } from "lucide-react"

import Skeleton from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import { confirmReportParticipation, getReportChecking, getReportUsers, type IReportByIdResponse } from "@/api/reports"
import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"

/** Длительность окна подтверждения по умолчанию (см. docs/API.md — 45 секунд). */
const CHECKING_WINDOW_SECONDS = 45

interface IProps {
  tgId: number
  data: IReportByIdResponse
  lastByType: LastSocketEventByType<QuizEvent>
}

/** Оставляем только валидные числовые telegram_id. */
function toIdArray(incoming: unknown): number[] | null {
  if (!Array.isArray(incoming)) return null
  return incoming.filter((id): id is number => typeof id === "number" && Number.isFinite(id))
}

function StatusChecking({ tgId, data, lastByType }: IProps) {
  const reportId = data?.id
  const isLeader = tgId === data?.user_id

  const { data: reportUsers, refetch: refetchUsers } = useQuery({
    queryKey: ["report-users", reportId],
    queryFn: () => getReportUsers(reportId!),
    enabled: !!reportId && !!tgId,
  })

  const users = reportUsers?.users ?? []
  const observers = reportUsers?.observers ?? []
  const isObserver = observers.includes(tgId)
  const isParticipant = users.includes(tgId)
  /** Кнопку «Участвую» видит только обычный участник: не ведущий и не наблюдатель. */
  const canConfirm = isParticipant && !isLeader && !isObserver

  /** Снимок окна для «догона» поздно подключившихся. */
  const { data: checkingSnapshot } = useQuery({
    queryKey: ["report-checking", reportId],
    queryFn: () => getReportChecking(reportId!),
    enabled: !!reportId && !!tgId,
    refetchOnWindowFocus: false,
  })

  /**
   * Подтвердившие участие + `time` события, которым они получены (серверная метка из WS).
   * `time` хранится в состоянии и используется для упорядочивания — как у `count-answers` в active/index.tsx:
   * сокеты могут приходить не по порядку (список из 4 раньше списка из 3), поэтому «старшие» события отбрасываем.
   */
  const [confirmedState, setConfirmedState] = useState<{ users: number[]; time: number }>({
    users: [],
    time: Number.NEGATIVE_INFINITY,
  })
  const confirmedUsers = confirmedState.users
  const [submitting, setSubmitting] = useState(false)
  const [hasConfirmedSelf, setHasConfirmedSelf] = useState(false)

  /** HTTP-источники (`GET /checking`, ответ `POST /confirm`) — без серверного `time`; список подтвердивших только растёт. */
  const applyConfirmedFromHttp = useCallback((incoming: unknown) => {
    const next = toIdArray(incoming)
    if (!next) return
    setConfirmedState((prev) => (next.length < prev.users.length ? prev : { users: next, time: prev.time }))
  }, [])

  /** WS-событие `checking` — применяем, только если оно не старше уже применённого (по `time` из бэкенда). */
  const applyConfirmedFromSocket = useCallback((incoming: unknown, time: unknown) => {
    const next = toIdArray(incoming)
    if (!next || typeof time !== "number" || !Number.isFinite(time)) return
    setConfirmedState((prev) => (time <= prev.time ? prev : { users: next, time }))
  }, [])

  useEffect(() => {
    if (!checkingSnapshot) return
    applyConfirmedFromHttp(checkingSnapshot.confirmed)
  }, [checkingSnapshot, applyConfirmedFromHttp])

  useSocketEventEffect(
    lastByType,
    "checking",
    (event) => {
      applyConfirmedFromSocket(event.users, event.time)
    },
    [applyConfirmedFromSocket],
  )

  useSocketEventEffect(
    lastByType,
    "user-removed",
    () => {
      void refetchUsers()
    },
    [refetchUsers],
  )

  // --- Локальный обратный отсчёт окна (45 с). `time` в событиях — метка упорядочивания, а не дедлайн. ---
  const [deadlineMs] = useState<number>(() => Date.now() + CHECKING_WINDOW_SECONDS * 1000)
  const [remainingSeconds, setRemainingSeconds] = useState(() => Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)))
  useEffect(() => {
    const tick = () => setRemainingSeconds(Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000)))
    tick()
    const timer = setInterval(tick, 250)
    return () => clearInterval(timer)
  }, [deadlineMs])

  const confirmedSet = useMemo(() => {
    const set = new Set(confirmedUsers)
    if (hasConfirmedSelf) set.add(tgId)
    return set
  }, [confirmedUsers, hasConfirmedSelf, tgId])

  /** В сетке показываем участников; ведущего исключаем (он не подтверждает). */
  const gridUsers = useMemo(() => users.filter((id) => id !== data?.user_id).sort((a, b) => a - b), [users, data?.user_id])

  const confirmedCount = gridUsers.filter((id) => confirmedSet.has(id)).length
  const totalToConfirm = gridUsers.length
  const progress = totalToConfirm > 0 ? Math.min(1, confirmedCount / totalToConfirm) : 0
  const selfConfirmed = confirmedSet.has(tgId)
  const timeUp = remainingSeconds <= 0
  const timeProgress = Math.max(0, Math.min(1, remainingSeconds / CHECKING_WINDOW_SECONDS))

  const handleConfirm = useCallback(() => {
    if (!reportId || submitting || selfConfirmed || timeUp) return
    setSubmitting(true)
    confirmReportParticipation(reportId)
      .then((res) => {
        setHasConfirmedSelf(true)
        if (Array.isArray(res?.confirmed)) applyConfirmedFromHttp(res.confirmed)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => setSubmitting(false))
  }, [reportId, submitting, selfConfirmed, timeUp, applyConfirmedFromHttp])

  const ringStyle = useMemo(
    () => ({ background: `conic-gradient(var(--accent-orb, #818cf8) ${progress * 360}deg, rgba(255,255,255,0.10) 0deg)` }),
    [progress],
  )

  return (
    <>
      <div
        className={cn(
          "flex h-full min-h-0 w-full flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pt-8 [-webkit-overflow-scrolling:touch]",
          canConfirm && "pb-28",
        )}
      >
        <header className="glass-start-liquid-palette relative shrink-0 overflow-hidden rounded-2xl border border-(--accent-orb)/40 p-4 sm:p-5">
          <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden rounded-t-2xl bg-white/8" aria-hidden>
            <div
              className="h-full w-full origin-left rounded-full bg-(--accent-orb)/85"
              style={{ transform: `scaleX(${timeProgress})` }}
            />
          </div>
          <div className="flex flex-row items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[0.58rem] font-semibold tracking-[0.2em] text-(--accent-orb)/90 uppercase">
                <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
                <span>Подтверждение участия</span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-balance text-white sm:text-2xl">
                {data?.quiz?.name ?? "Готовимся к старту"}
              </h2>
              <p className="max-w-prose text-xs leading-relaxed text-pretty text-white/60 sm:text-sm">
                {canConfirm
                  ? "Нажмите «Участвую», чтобы остаться в игре. Кто не подтвердит — выбывает."
                  : isLeader
                    ? "Ждём, пока участники подтвердят участие. Игра начнётся автоматически."
                    : "Идёт подтверждение участников. Вы наблюдаете за игрой."}
              </p>
            </div>

            <div className="relative grid size-16 shrink-0 place-items-center sm:size-18" role="timer" aria-live="polite">
              <div className="absolute inset-0 rounded-full p-0.75 transition-[background] duration-300" style={ringStyle}>
                <div className="size-full rounded-full bg-black/55 backdrop-blur-md" />
              </div>
              <div className="relative z-10 flex flex-col items-center leading-none">
                <Timer className="mb-0.5 size-3 text-white/45" aria-hidden />
                <span className="font-mono text-lg font-bold text-white tabular-nums sm:text-xl">{remainingSeconds}</span>
                <span className="text-[0.5rem] font-medium tracking-wider text-white/40 uppercase">сек</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[0.7rem] font-medium text-white/65">
              <span className="inline-flex items-center gap-1.5">
                <UserRoundCheck className="size-3.5 text-faithful/80" aria-hidden />
                Подтвердили
              </span>
              <span className="font-mono tabular-nums">
                <span className="text-faithful">{confirmedCount}</span>
                <span className="mx-0.5 text-white/30">/</span>
                <span className="text-white/70">{totalToConfirm}</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-full origin-left rounded-full bg-faithful"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
          </div>
        </header>

        <section className="relative w-full flex-1 py-1" aria-label={`Участники: ${gridUsers.length}`}>
          {gridUsers.length === 0 ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/4 px-4 py-10 text-center">
              <UserRoundCheck className="size-10 text-white/25" aria-hidden />
              <p className="max-w-xs text-sm text-white/50">Список участников пуст.</p>
            </div>
          ) : (
            <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-3">
              {gridUsers.map((id) => (
                <CheckingUserCard key={id} userId={id} viewerTgId={tgId} confirmed={confirmedSet.has(id)} isSelf={id === tgId} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Нижняя панель действия — только для участника, который ещё не подтвердил */}
      {canConfirm && (
        <div className="bottom-next fixed inset-x-0 z-40 px-3 pt-6 pb-3">
          <div className="pointer-events-auto mx-auto w-full max-w-md">
            {selfConfirmed ? (
              <div className="glass-start-liquid-palette flex items-center justify-center gap-2 rounded-xl border border-faithful/40 bg-faithful/10 px-5 py-3.5 text-sm font-semibold text-faithful">
                <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                Вы подтвердили участие — ждём остальных
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting || timeUp}
                className={cn(
                  "glass-start-btn-faithful-palette group flex w-full items-center justify-center gap-2.5 px-5 py-3.5 text-base font-semibold transition-all active:scale-[0.98]",
                  "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-faithful/60",
                  "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
                )}
              >
                {submitting ? (
                  <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <UserRoundCheck className="size-5 shrink-0 transition-transform group-hover:scale-110" aria-hidden />
                )}
                {timeUp ? "Время вышло" : submitting ? "Подтверждаем…" : "Участвую"}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function CheckingUserCard({
  userId,
  viewerTgId,
  confirmed,
  isSelf,
}: {
  userId: number
  viewerTgId: number
  confirmed: boolean
  isSelf: boolean
}) {
  const { data, isLoading } = useUserByTgId(userId, { enabled: !!userId && !!viewerTgId })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <Skeleton className="size-12 rounded-full sm:size-13 md:size-14" />
        <Skeleton className="h-3 w-full rounded-md" />
      </div>
    )
  }

  const pseudo = data?.pseudo?.trim() || `Участник ${userId}`

  return (
    <div
      className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-1"
      title={confirmed ? `${pseudo} — подтвердил участие` : `${pseudo} — ещё не подтвердил`}
      aria-label={`${pseudo}${confirmed ? ", подтвердил" : ", ожидает подтверждения"}`}
    >
      <div className="relative">
        <UserAvatar
          variant="waiting"
          bare
          avatar={data?.avatar}
          bg={data?.bg}
          pseudo={pseudo}
          photoUrl={data?.photo_url}
          element={data?.element}
          className={cn(
            "transition-all duration-500",
            confirmed ? "border-faithful/80 ring-2 ring-faithful/30" : "border-white/15 opacity-45 grayscale saturate-0",
          )}
        />
        {confirmed ? (
          <span
            className="absolute -right-0.5 -bottom-0.5 z-10 flex size-5 items-center justify-center rounded-full border-2 border-black/60 bg-faithful sm:size-5.5"
            aria-hidden
          >
            <CheckCircle2 className="size-3 text-white sm:size-3.5" />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "max-w-16 truncate text-[0.65rem] leading-none transition-colors duration-500 sm:max-w-20",
          confirmed ? "font-medium text-white/90" : "text-white/40",
        )}
      >
        {isSelf ? "Вы" : pseudo}
      </p>
    </div>
  )
}

StatusChecking.displayName = "StatusChecking"
export default StatusChecking
