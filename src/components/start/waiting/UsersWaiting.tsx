"use client"

import { Users } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { off, on, postEvent, type PopupButton } from "@tma.js/sdk"
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"

import Skeleton from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/common/UserAvatar"
const LottieObserver = lazy(() => import("./LottieObserver"))
import { TeamBonusesDialog } from "@/components/start/teams/TeamBonusesDialog"
import { PairBezierFrame, pairAvatarRingStyle } from "@/components/start/teams/PairBezierOverlay"
import { TeamPairBadge } from "@/components/start/teams/TeamPairBadge"
import { reportTeamsQueryKey, useReportTeams } from "@/components/start/teams/use-report-teams"

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import { postTeamInvite, removeUserFromReportUsers, revokeTeamInvite, type ITeam, type ITeamInvite } from "@/api/reports"
import { ApiRequestError } from "@/api/errors"
import { pairColor, teamOfMember } from "@/lib/report-teams"
import { showToast } from "@/stores/toast"
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
  /** Игрок в лобби может звать в пару. Ведущий и наблюдатель — нет. */
  canInvite: boolean
}

type LobbyCard = { user: number; type: "user" | "observer" }

type LobbyGroup =
  | { kind: "pair"; team: ITeam; members: LobbyCard[] }
  | { kind: "single"; card: LobbyCard }

function toastTeamError(error: unknown) {
  if (ApiRequestError.is(error)) {
    showToast(error.message)
    return
  }
  showToast("Не удалось обновить команду")
}

function buildLobbyGroups(cards: LobbyCard[], teams: ITeam[]): LobbyGroup[] {
  const players = cards.filter((card) => card.type === "user")
  const observers = cards.filter((card) => card.type === "observer").sort((a, b) => a.user - b.user)
  const byId = new Map(players.map((card) => [card.user, card]))
  const used = new Set<number>()
  const groups: LobbyGroup[] = []
  const orderedTeams = [...teams].sort((a, b) => Math.min(...a.members) - Math.min(...b.members))
  for (const team of orderedTeams) {
    const members = [...team.members]
      .sort((a, b) => a - b)
      .map((id) => byId.get(id))
      .filter((card): card is LobbyCard => !!card)
    if (members.length < 2) continue
    members.forEach((card) => used.add(card.user))
    groups.push({ kind: "pair", team, members })
  }
  for (const card of players.filter((item) => !used.has(item.user)).sort((a, b) => a.user - b.user)) {
    groups.push({ kind: "single", card })
  }
  for (const card of observers) groups.push({ kind: "single", card })
  return groups
}

function UsersWaiting({
  users: initialUsers = { users: [], observers: [] },
  tgId,
  reportId,
  lastByType,
  isLeader,
  canInvite,
}: UsersWaitingProps) {
  const usersSource = initialUsers ?? { users: [], observers: [] }
  const { users = [], observers = [] } = usersSource

  const totalUsersRaw = [
    ...users.map((user) => ({ user, type: "user" as const })),
    ...observers.map((observer) => ({ user: observer, type: "observer" as const })),
  ]

  const uniqueByTelegramId = new Map<number, LobbyCard>()
  for (const item of totalUsersRaw) {
    const prev = uniqueByTelegramId.get(item.user)
    if (!prev || (prev.type === "observer" && item.type === "user")) {
      uniqueByTelegramId.set(item.user, item)
    }
  }

  const totalUsers = [...uniqueByTelegramId.values()].filter((item) => !(isLeader && item.user === tgId))

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
        <CenterPlayerGrid
          users={totalUsers}
          tgId={tgId}
          reportId={reportId}
          isLeader={isLeader}
          canInvite={canInvite}
          lastByType={lastByType}
        />
      )}
    </section>
  )
}

UsersWaiting.displayName = "UsersWaiting"
export default UsersWaiting

interface IProps {
  users: LobbyCard[]
  tgId: number
  reportId: number
  isLeader: boolean
  canInvite: boolean
  lastByType: LastSocketEventByType<QuizEvent>
}

function parseUserProfileUpdatedPayload(msg: Record<string, unknown>) {
  const telegramRaw = msg.telegram_id ?? (msg.data as Record<string, unknown> | undefined)?.telegram_id
  const reportRaw = msg.report_id ?? (msg.data as Record<string, unknown> | undefined)?.report_id
  const telegramId = typeof telegramRaw === "number" ? telegramRaw : typeof telegramRaw === "string" ? Number(telegramRaw) : NaN
  return Number.isFinite(telegramId) && reportRaw != null ? { telegramId, reportId: reportRaw } : null
}

function CenterPlayerGrid({ users, tgId, reportId, isLeader, canInvite, lastByType }: IProps) {
  const queryClient = useQueryClient()
  const [highlightedTelegramId, setHighlightedTelegramId] = useState<number | null>(null)
  const [bonusesTeam, setBonusesTeam] = useState<ITeam | null>(null)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playersCount = users.filter((item) => item.type === "user").length
  const { data: teamsState } = useReportTeams({ reportId, lastByType })
  const teams = teamsState?.teams ?? []
  const invites = teamsState?.invites ?? []
  const groups = useMemo(() => buildLobbyGroups(users, teams), [users, teams])

  const refreshTeams = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: reportTeamsQueryKey(reportId) })
  }, [queryClient, reportId])

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
      const parts = buttonId.split("|")
      if (parts.length !== 3) return
      const [action, rid, targetRaw] = parts
      if (String(rid) !== String(reportId)) return

      if (action === "remove_report_user") {
        const targetTg = Number(targetRaw)
        if (!Number.isFinite(targetTg)) return
        void removeUserFromReportUsers(reportId, targetTg).catch((e) => {
          console.error(e)
        })
        return
      }

      if (action === "create_team") {
        const targetTg = Number(targetRaw)
        if (!Number.isFinite(targetTg)) return
        void postTeamInvite(reportId, targetTg)
          .then((res) => {
            showToast(res.team ? "Команда создана" : "Заявка отправлена")
            refreshTeams()
          })
          .catch(toastTeamError)
        return
      }

      if (action === "revoke_team") {
        void revokeTeamInvite(reportId, targetRaw)
          .then(() => {
            showToast("Заявка отозвана")
            refreshTeams()
          })
          .catch(toastTeamError)
      }
    }

    on("popup_closed", handlePopupClosed)
    return () => off("popup_closed", handlePopupClosed)
  }, [reportId, refreshTeams])

  return (
    <div
      className={cn("relative w-full after:leading-none after:text-white/6 after:tabular-nums after:select-none", styles.wrapper)}
      style={{ "--num": playersCount }}
    >
      <div className="relative z-10 flex min-h-60 w-full flex-wrap content-start gap-3">
        {groups.map((group) => {
          if (group.kind === "pair") {
            const color = pairColor(group.team.id)
            const isMine = group.team.members.includes(tgId)
            const [first, second] = group.members
            if (!first || !second) return null
            return (
              <PairBezierFrame
                key={group.team.id}
                className={cn("flex items-start gap-5", isMine && "cursor-pointer")}
                pairs={[{ id: group.team.id, color, a: first.user, b: second.user, pulse: isMine }]}
                onClick={
                  isMine
                    ? (event) => {
                        if (event.target === event.currentTarget) setBonusesTeam(group.team)
                      }
                    : undefined
                }
              >
                {group.members.map((item) => (
                  <UserWaiting
                    key={`${item.type}-${item.user}`}
                    user={item.user}
                    tgId={tgId}
                    reportId={reportId}
                    isLeader={isLeader}
                    canInvite={canInvite}
                    type={item.type}
                    highlighted={highlightedTelegramId === item.user}
                    team={group.team}
                    pairColor={color}
                    invites={invites}
                    myTeam={teamOfMember(teams, tgId)}
                    onOpenBonuses={isMine ? () => setBonusesTeam(group.team) : undefined}
                  />
                ))}
              </PairBezierFrame>
            )
          }
          const item = group.card
          return (
            <UserWaiting
              key={`${item.type}-${item.user}`}
              user={item.user}
              tgId={tgId}
              reportId={reportId}
              isLeader={isLeader}
              canInvite={canInvite}
              type={item.type}
              highlighted={highlightedTelegramId === item.user}
              invites={invites}
              myTeam={teamOfMember(teams, tgId)}
              theirTeam={item.type === "user" ? teamOfMember(teams, item.user) : undefined}
            />
          )
        })}
      </div>
      {bonusesTeam ? <TeamBonusesDialog team={bonusesTeam} viewerTgId={tgId} onClose={() => setBonusesTeam(null)} /> : null}
    </div>
  )
}

function UserWaiting({
  user,
  tgId,
  reportId,
  isLeader,
  canInvite,
  type,
  highlighted,
  team,
  pairColor: color,
  invites,
  myTeam,
  theirTeam,
  onOpenBonuses,
}: {
  user: number
  tgId: number
  reportId: number
  isLeader: boolean
  canInvite: boolean
  type: "user" | "observer"
  highlighted: boolean
  team?: ITeam
  pairColor?: string
  invites: ITeamInvite[]
  myTeam?: ITeam
  theirTeam?: ITeam
  onOpenBonuses?: () => void
}) {
  const { data, isLoading } = useUserByTgId(user, { enabled: !!user && !!tgId })

  const bg = data?.bg
  const isObserver = type === "observer"
  const isSelf = user === tgId
  const shouldPulse = highlighted
  const avatarClass = shouldPulse
    ? "border-(--accent-orb) ring-2 ring-(--accent-orb)/30 animate-pulse"
    : isObserver
      ? "border-white/25"
      : "border-(--accent-orb)/35"
  const canRemoveFromReport = isLeader && !isLoading
  const outgoing = invites.find((invite) => invite.status === "pending" && invite.from === tgId && invite.to === user)
  const incoming = invites.find((invite) => invite.status === "pending" && invite.from === user && invite.to === tgId)
  const myOutgoing = invites.find((invite) => invite.status === "pending" && invite.from === tgId)
  const isPartner = !!team && team.members.includes(tgId) && team.members.includes(user) && !isSelf
  const isSelfPair = !!color && !!team?.members.includes(tgId)
  const occupiedByOther = !!theirTeam && !isPartner

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

  function openCreateTeamPopup() {
    const pseudoLabel = data?.pseudo?.trim() || `Участник ${user}`
    const buttons: PopupButton[] = [
      { id: "cancel_create_team", type: "cancel" },
      { id: `create_team|${reportId}|${user}`, text: "Создать", type: "default" },
    ]
    postEvent("web_app_open_popup", {
      title: "Создать команду",
      message: `Хотите создать команду с «${pseudoLabel}»?`,
      buttons,
    })
  }

  function openRevokePopup() {
    if (!outgoing) return
    const pseudoLabel = data?.pseudo?.trim() || `Участник ${user}`
    const buttons: PopupButton[] = [
      { id: "cancel_revoke_team", type: "cancel" },
      { id: `revoke_team|${reportId}|${outgoing.id}`, text: "Отозвать", type: "destructive" },
    ]
    postEvent("web_app_open_popup", {
      title: "Отозвать заявку?",
      message: `Отозвать приглашение для «${pseudoLabel}»?`,
      buttons,
    })
  }

  function onPlayerClick() {
    if (isLoading) return
    if (isSelf || isPartner) {
      onOpenBonuses?.()
      return
    }
    if (isObserver) return
    if (canRemoveFromReport) {
      openRemoveUserPopup()
      return
    }
    if (!canInvite) return
    if (outgoing) {
      openRevokePopup()
      return
    }
    if (myTeam) {
      showToast("Вы уже в паре")
      return
    }
    if (occupiedByOther) {
      showToast("Игрок уже в паре")
      return
    }
    if (myOutgoing && myOutgoing.to !== user) {
      showToast("Заявка уже отправлена")
      return
    }
    openCreateTeamPopup()
  }

  const interactive =
    !isLoading &&
    (((isSelf || isPartner) && !!onOpenBonuses) || canRemoveFromReport || (canInvite && !isObserver && !isSelf))
  const title =
    (isSelf || isPartner) && onOpenBonuses
      ? "Нажмите, чтобы посмотреть бонусы пары"
      : canRemoveFromReport
        ? `${data?.pseudo ?? ""} — нажмите, чтобы исключить из игроков`
        : outgoing
          ? `${data?.pseudo ?? ""} — ожидает ответ, нажмите чтобы отозвать`
          : canInvite && !isObserver && !isSelf
            ? `${data?.pseudo ?? ""} — нажмите, чтобы создать команду`
            : (data?.pseudo ?? "")

  return (
    <div
      data-user-card={user}
      className={cn(
        "relative z-10 flex min-h-0 w-18 min-w-0 flex-col items-center justify-center gap-1 outline-none sm:w-20",
        interactive && "cursor-pointer",
      )}
      title={title}
      aria-label={data?.pseudo ?? ""}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onPlayerClick : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onPlayerClick()
              }
            }
          : undefined
      }
    >
      {isLoading ? (
        <>
          <Skeleton className="size-12 rounded-full sm:size-13 md:size-14 lg:size-15" />
          <Skeleton className="h-3 w-full rounded-md" />
        </>
      ) : (
        <>
          <div
            className="relative z-10 inline-grid shrink-0 rounded-full"
            data-pair-anchor={color ? user : undefined}
            style={color ? pairAvatarRingStyle(color) : undefined}
          >
            {color && isSelfPair ? (
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-px animate-pulse rounded-full"
                style={{ boxShadow: `0 0 12px ${color}` }}
              />
            ) : null}
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
              partnerTelegramId={team?.members.find((id) => id !== user)}
              partnerColor={color}
            />
          </div>
          <p
            className={cn(
              "relative z-10 max-w-16 truncate text-[0.65rem] leading-none sm:max-w-20",
              color ? "font-medium" : isObserver ? "text-white/55" : "text-white/90",
            )}
            style={color ? { color } : undefined}
          >
            {data?.pseudo ?? ""}
          </p>
          {color ? <TeamPairBadge color={color} onClick={onOpenBonuses} /> : null}
          {outgoing ? <span className="text-[0.6rem] leading-none text-white/55">ожидает</span> : null}
          {incoming && canInvite ? <span className="text-[0.6rem] leading-none text-white/70">зовёт вас</span> : null}
        </>
      )}
    </div>
  )
}
