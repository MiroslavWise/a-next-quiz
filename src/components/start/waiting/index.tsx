"use client"

import SessionCodeCopyButton from "./SessionCodeCopyButton"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState, lazy, Suspense, useCallback } from "react"
import Image from "next/image"
import { QrCode } from "lucide-react"

import UsersWaiting from "./UsersWaiting"
import Skeleton from "@/components/ui/skeleton"
import ButtonToObserver from "./ButtonToObserver"
const PrizesPicker = lazy(() => import("./PrizesPicker"))
const RandomPrizeLobbyBanner = lazy(() => import("./RandomPrizeLobbyBanner"))
const FullscreenQrCode = lazy(() => import("./FullscreenQrCode"))
import { UserAvatar } from "@/components/common/UserAvatar"
const ElementPickPromptBanner = lazy(() => import("./ElementPickPromptBanner"))
const WaitingLeaderStartFooter = lazy(() => import("./WaitingLeaderStartFooter"))
const ElementsUserButton = lazy(() => import("@/components/common/ElementsUserButton"))

import { cn } from "@/lib/utils"
import { useAuthJwtClaims } from "@/lib/jwt"
import { useUserByTgId } from "@/queries/user"
import { TELEGRAM_BOT_USERNAME } from "@/config/env"
import { dispatchUpdateInfo } from "@/stores/update-info"
import { LOBBY_ICON_BUTTON_CLASS } from "@/components/start/waiting/lobby-icon-button"
import { addMemberToReport, getReportUsers, updateToStartReport, type IReportByIdResponse } from "@/api/reports"
import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"

import styles from "./waiting.module.scss"

const REPORT_USERS_REFETCH_DEBOUNCE_MS = 2_500

const PRIZES_PICKER_SECTION_CLASS =
  "glass-start-liquid-palette w-full max-w-[calc(100vw-2rem)] shrink-0 space-y-2.5 overflow-hidden rounded-2xl p-3 sm:p-4"

function PrizesPickerSkeleton({ usersCount }: { usersCount: number }) {
  return (
    <section className={PRIZES_PICKER_SECTION_CLASS} aria-label="Призовые места" aria-busy="true">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-3.5 shrink-0 rounded-sm bg-white/10" />
            <Skeleton className="h-3.5 w-28 rounded-md bg-white/12 sm:h-4" />
          </div>
          <Skeleton className="h-3 w-full max-w-xs rounded-md bg-white/8 sm:h-3.5" />
        </div>
      </div>
      {usersCount > 0 ? (
        <>
          <div className="flex scrollbar-thin gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [-webkit-overflow-scrolling:touch]">
            {Array.from({ length: usersCount }, (_, index) => (
              <Skeleton key={index} className="size-9 shrink-0 rounded-xl border border-white/12 bg-white/8" />
            ))}
          </div>
          <Skeleton className="h-3 w-36 rounded-md bg-white/8" />
        </>
      ) : null}
    </section>
  )
}

const waitingToolbarBtn = cn(
  "inline-flex h-7 shrink-0 items-center justify-center rounded-lg border border-(--accent-orb)/30 bg-(--accent-orb)/10",
  "transition-colors hover:border-(--accent-orb)/50 hover:bg-(--accent-orb)/16",
  "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--accent-orb)/50",
)

const waitingToolbarIconBtn = cn(waitingToolbarBtn, "w-7")

const WAITING_STATUS_LABEL = "Ожидание"
const WAITING_STATUS_LETTER_COLORS = [
  styles.statusLetterOne,
  styles.statusLetterTwo,
  styles.statusLetterThree,
  styles.statusLetterFour,
] as const

interface IProps {
  tgId: number
  data: IReportByIdResponse
  lastByType: LastSocketEventByType<QuizEvent>
}

function StatusWaiting(props: IProps) {
  const reportUsersRefetchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [loading, setLoading] = useState(false)
  const [movingToObserver, setMovingToObserver] = useState(false)
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(false)
  const { tgId, data, lastByType } = props
  const { quiz, code, questions } = data ?? {}
  const { name, description, imageUrl, image_url } = quiz ?? {}
  const coverUrl = imageUrl ?? image_url

  const claims = useAuthJwtClaims()
  const isAdminManager = !!(claims?.is_admin || claims?.is_manager)

  const {
    data: users,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["report-users", data?.id],
    queryFn: () => getReportUsers(data?.id!),
    enabled: !!data?.id && !!tgId,
  })

  const meInUsers = !!users?.users?.includes(tgId)
  const meInObservers = !!users?.observers?.includes(tgId)
  const isLeader = tgId === data?.user_id
  const playersCount = users?.users?.length ?? 0

  const { data: me } = useUserByTgId(tgId)

  const myDisplayName = me?.pseudo?.trim() || `Пользователь ${tgId}`
  const myFullName = [me?.first_name, me?.last_name].filter(Boolean).join(" ").trim()
  const canBecomeObserver = isAdminManager && meInUsers && !meInObservers
  const showElementPickPrompt = meInUsers && !me?.element
  /** Кнопка «Профиль» в карточке; ведущему карточка не показывается — дублируем кнопку в шапке */
  const showParticipantProfileCard = (meInUsers || meInObservers) && !isLeader

  useEffect(() => {
    Promise.all([
      import("@/components/start/active"),
      import("@/components/start/StatusStart"),
      import("@/components/start/checking"),
    ]).catch((err) => console.warn("Prefetch failed", err))
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (!isLeader) {
      if (!meInObservers) {
        if (!meInUsers) {
          addMemberToReport(data?.id!)
            .then((res) => {
              console.log(res)
            })
            .catch((err) => {
              console.error(err)
            })
        }
      }
    }
  }, [meInUsers, meInObservers, isLeader, tgId, data?.id, isLoading])

  function handleOpenProfile() {
    dispatchUpdateInfo(me?.avatar ?? "", myDisplayName || myFullName || "", me?.bg ?? "")
  }

  /** Универсальная ссылка: удобно копировать и открывать из чата/браузера */
  const url = `https://t.me/${TELEGRAM_BOT_USERNAME}?startapp=${code}`
  /**
   * Deep link для QR: обычно сразу открывает Telegram, без захода в браузер.
   * @see https://core.telegram.org/api/links (tg://resolve … startapp)
   */

  /** Старт доступен, если есть хотя бы один игрок. */
  const canStart = playersCount >= 1

  const handleStart = useCallback(() => {
    if (loading || !isLeader || !canStart) return
    setLoading(true)
    updateToStartReport(data?.id!)
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [data?.id, isLeader, loading, canStart])

  const scheduleReportUsersRefetch = useCallback(() => {
    if (reportUsersRefetchDebounce.current) clearTimeout(reportUsersRefetchDebounce.current)
    reportUsersRefetchDebounce.current = setTimeout(() => {
      reportUsersRefetchDebounce.current = null
      void refetch()
    }, REPORT_USERS_REFETCH_DEBOUNCE_MS)
  }, [refetch])

  useEffect(() => {
    return () => {
      if (reportUsersRefetchDebounce.current) {
        clearTimeout(reportUsersRefetchDebounce.current)
        reportUsersRefetchDebounce.current = null
      }
    }
  }, [])

  useSocketEventEffect(lastByType, "new-user", scheduleReportUsersRefetch)
  useSocketEventEffect(lastByType, "user-moved-to-observer", scheduleReportUsersRefetch)
  useSocketEventEffect(lastByType, "user-removed", scheduleReportUsersRefetch)

  return (
    <>
      <div
        className={cn(
          "flex h-full min-h-0 w-full flex-col gap-2.5 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pt-8 [-webkit-overflow-scrolling:touch]",
          isLeader ? "pb-28" : "pb-16",
        )}
      >
        <header className={cn("glass-start-liquid-palette relative shrink-0 rounded-2xl p-3 sm:p-4", styles.header)}>
          <span className={styles.headerScan} aria-hidden />
          <span className={styles.headerSliceA} aria-hidden />
          <span className={styles.headerSliceB} aria-hidden />
          <div className={cn("space-y-2.5", styles.headerContent)}>
            <div className="flex flex-row items-center justify-between gap-2">
              <p
                className={cn("text-[0.58rem] font-semibold tracking-[0.2em] uppercase", styles.statusLabel)}
                role="status"
                aria-label={WAITING_STATUS_LABEL}
              >
                {[...WAITING_STATUS_LABEL].map((letter, index) => (
                  <span
                    key={`${letter}-${index}`}
                    className={cn(styles.statusLetter, WAITING_STATUS_LETTER_COLORS[index % WAITING_STATUS_LETTER_COLORS.length])}
                    data-text={letter}
                    aria-hidden
                  >
                    {letter}
                  </span>
                ))}
              </p>
              <div className="flex flex-row items-center gap-2">
                {code ? (
                  <>
                    <SessionCodeCopyButton
                      code={code}
                      textToCopy={url}
                      className={cn(waitingToolbarBtn, "gap-1 px-2 font-mono text-[0.68rem] tracking-[0.28em] tabular-nums")}
                    />
                    <button
                      type="button"
                      onClick={() => setIsQrCodeOpen(true)}
                      className={waitingToolbarIconBtn}
                      aria-label="Показать QR-код на весь экран"
                      title="Показать QR-код на весь экран"
                    >
                      <QrCode className="size-3.5 text-white/65" aria-hidden />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            {coverUrl ? (
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4">
                <div className="relative aspect-square w-full max-w-28 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/6 sm:w-28 sm:max-w-none">
                  <Image src={coverUrl} alt="" fill sizes="7rem" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5 text-center sm:text-left">
                  <h2
                    className={cn("text-2xl font-semibold tracking-tight text-balance sm:text-[1.85rem]", styles.quizTitle)}
                    data-text={name ?? ""}
                  >
                    {name}
                  </h2>
                  {description ? (
                    <p className="mx-auto max-w-prose text-xs leading-relaxed text-pretty text-white/65 sm:mx-0 sm:text-sm">
                      {description}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <h2
                  className={cn("text-2xl font-semibold tracking-tight text-balance sm:text-[1.85rem]", styles.quizTitle)}
                  data-text={name ?? ""}
                >
                  {name}
                </h2>
                {description ? (
                  <p className="max-w-prose text-xs leading-relaxed text-pretty text-white/65 sm:text-sm">{description}</p>
                ) : null}
              </>
            )}
            <p className="text-xs sm:text-sm">
              <span className="text-white/45">Вопросов: </span>
              <span className="font-medium text-white/90 tabular-nums">{questions?.length ?? 0}</span>
            </p>
          </div>
        </header>
        {showParticipantProfileCard && (
          <div className="flex w-full shrink-0 flex-col gap-2">
            {showElementPickPrompt && (
              <Suspense
                fallback={<Skeleton className="h-17 w-full shrink-0 rounded-xl border border-white/12 bg-white/6 sm:h-18" aria-hidden />}
              >
                <ElementPickPromptBanner />
              </Suspense>
            )}
            <section
              className="glass-start-liquid-palette flex min-w-0 w-full flex-row items-center justify-between gap-1.5 overflow-hidden rounded-2xl p-2.5 sm:p-3"
              aria-label={meInUsers ? "Ваш профиль в игре" : "Ваш профиль наблюдателя"}
            >
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  title="Изменить профиль"
                  aria-label="Изменить профиль"
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left sm:gap-3",
                    "cursor-pointer transition-colors hover:bg-white/6",
                    "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white/40",
                  )}
                >
                  <UserAvatar
                    variant="waiting-profile"
                    avatar={me?.avatar}
                    bg={me?.bg}
                    pseudo={myDisplayName}
                    photoUrl={me?.photo_url}
                    element={me?.element}
                    className={cn(meInUsers ? "border-emerald-400/35" : "border-amber-400/80")}
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <p className="min-w-0 truncate text-sm font-semibold tracking-tight text-white sm:text-base">{myDisplayName}</p>
                      {isAdminManager ? (
                        <span
                          title={meInUsers ? "Участвуете как игрок" : "Режим наблюдателя, ответы не отправляются"}
                          className={cn(
                            "shrink-0 rounded border px-1 py-px text-[0.6rem] leading-none font-semibold tracking-wide uppercase",
                            meInUsers
                              ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-200/90"
                              : "border-amber-400/40 bg-amber-500/12 text-amber-100/85",
                          )}
                        >
                          {meInUsers ? "Игрок" : "Наблюдатель"}
                        </span>
                      ) : null}
                    </div>
                    {myFullName ? <p className="truncate text-[0.7rem] text-white/55 sm:text-xs">{myFullName}</p> : null}
                  </div>
                </button>
                <div className="flex shrink-0 flex-row items-center gap-2">
                  {canBecomeObserver ? (
                    <ButtonToObserver
                      movingToObserver={movingToObserver}
                      tgId={tgId}
                      reportId={data?.id!}
                      setMovingToObserver={setMovingToObserver}
                    />
                  ) : null}
                  {meInUsers && me?.element ? (
                    <Suspense fallback={<Skeleton className={cn(LOBBY_ICON_BUTTON_CLASS, "animate-pulse bg-white/8")} />}>
                      <ElementsUserButton className={LOBBY_ICON_BUTTON_CLASS} element={me.element} />
                    </Suspense>
                  ) : null}
                </div>
              </section>
          </div>
        )}
        {isLeader && (
          <Suspense fallback={<PrizesPickerSkeleton usersCount={playersCount} />}>
            <PrizesPicker reportId={data.id} prizes={data.prizes ?? []} usersCount={playersCount} isLeader={isLeader} />
          </Suspense>
        )}
        <Suspense
          fallback={
            <Skeleton
              className="h-16 w-full max-w-[calc(100vw-2rem)] shrink-0 rounded-xl border border-emerald-300/20 bg-emerald-500/6 sm:h-17"
              aria-hidden
            />
          }
        >
          <RandomPrizeLobbyBanner />
        </Suspense>
        <UsersWaiting users={users!} tgId={tgId!} reportId={data.id} lastByType={lastByType} isLeader={isLeader} />
        {!isLeader ? <div className="spacer-bottom-game" aria-hidden /> : null}
        {isLeader && (
          <Suspense fallback={null}>
            <WaitingLeaderStartFooter onStart={handleStart} loading={loading} disabled={!canStart} hint="Нужен хотя бы один игрок" />
          </Suspense>
        )}
      </div>
      {code ? (
        <Suspense fallback={null}>
          <FullscreenQrCode open={isQrCodeOpen} onOpenChange={setIsQrCodeOpen} url={url} sessionCode={code} />
        </Suspense>
      ) : null}
    </>
  )
}

StatusWaiting.displayName = "StatusWaiting"
export default StatusWaiting
