"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import Button from "@/components/ui/button"
import { acceptTeamInvite, declineTeamInvite, type ITeamInvite } from "@/api/reports"
import { ApiRequestError } from "@/api/errors"
import { useUserByTgId } from "@/queries/user"
import { showToast } from "@/stores/toast"
import { reportTeamsQueryKey } from "./use-report-teams"

function toastTeamError(error: unknown) {
  if (ApiRequestError.is(error)) {
    showToast(error.message)
    return
  }
  showToast("Не удалось обновить команду")
}

function IncomingInviteBanner({
  reportId,
  invite,
  tgId,
}: {
  reportId: string | number
  invite: ITeamInvite
  tgId: number
}) {
  const queryClient = useQueryClient()
  const { data } = useUserByTgId(invite.from, { enabled: !!invite.from && !!tgId })
  const [pending, setPending] = useState<"accept" | "decline" | null>(null)
  const name = data?.pseudo?.trim() || `Участник ${invite.from}`

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: reportTeamsQueryKey(reportId) })
  }

  return (
    <div
      className="glass-start-liquid-palette flex w-full max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-2xl p-3 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <p className="min-w-0 text-sm text-white/90">
        <span className="font-semibold text-white">{name}</span> зовёт в пару
      </p>
      <div className="flex shrink-0 gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending != null}
          onClick={() => {
            setPending("accept")
            void acceptTeamInvite(reportId, invite.id)
              .then(async () => {
                showToast("Вы в паре")
                await refresh()
              })
              .catch(toastTeamError)
              .finally(() => setPending(null))
          }}
        >
          Принять
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/20 bg-transparent text-white hover:bg-white/10"
          disabled={pending != null}
          onClick={() => {
            setPending("decline")
            void declineTeamInvite(reportId, invite.id)
              .then(refresh)
              .catch(toastTeamError)
              .finally(() => setPending(null))
          }}
        >
          Отклонить
        </Button>
      </div>
    </div>
  )
}

export function TeamInviteBanners({
  reportId,
  tgId,
  invites,
}: {
  reportId: string | number
  tgId: number
  invites: ITeamInvite[]
}) {
  const incoming = invites.filter((invite) => invite.status === "pending" && invite.to === tgId)
  if (!incoming.length) return null
  return (
    <div className="flex w-full flex-col gap-2">
      {incoming.map((invite) => (
        <IncomingInviteBanner key={invite.id} reportId={reportId} invite={invite} tgId={tgId} />
      ))}
    </div>
  )
}
