"use client"

import { useQuery } from "@tanstack/react-query"

import { useAuthJwtClaims } from "@/lib/jwt"
import { getReportMyRole, getReportUsers } from "@/api/reports"

interface IUseReportParticipationParams {
  reportId: string
  tgId: number
  user_id: number
}

/** Роль текущего зрителя в отчёте: лидер / наблюдатель / обычный участник + состав отчёта. */
export function useReportParticipation({ reportId, tgId, user_id }: IUseReportParticipationParams) {
  const claims = useAuthJwtClaims()
  const isAdminManager = !!(claims?.is_admin || claims?.is_manager)
  const isLeader = tgId === user_id

  const { data: myRole, isFetching: isFetchingMyRole } = useQuery({
    queryKey: ["report-my-role", reportId, tgId],
    queryFn: () => getReportMyRole(reportId),
    enabled: !!reportId && !!tgId && isAdminManager && !isLeader,
  })

  const { data: reportUsers } = useQuery({
    queryKey: ["report-users", reportId],
    queryFn: () => getReportUsers(reportId),
    enabled: !!reportId && !!tgId,
  })

  const observers = reportUsers?.observers ?? []
  const users = reportUsers?.users ?? []
  const isObserver = myRole?.role === "observer" || observers?.includes(tgId)
  const isObserverLikeLeader = isLeader || isObserver
  const participantsTotal = users?.length ?? 0

  return {
    isAdminManager,
    isLeader,
    myRole,
    isFetchingMyRole,
    observers,
    users,
    isObserver,
    isObserverLikeLeader,
    participantsTotal,
  }
}
