"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

import { getReportTeams } from "@/api/reports"
import { useSocketEventEffect, type LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"

export function reportTeamsQueryKey(reportId: string | number) {
  return ["report-teams", String(reportId)] as const
}

export function useReportTeams({
  reportId,
  lastByType,
  enabled = true,
}: {
  reportId: string | number
  lastByType?: LastSocketEventByType<QuizEvent>
  enabled?: boolean
}) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: reportTeamsQueryKey(reportId),
    queryFn: () => getReportTeams(reportId),
    enabled: !!reportId && enabled,
  })

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: reportTeamsQueryKey(reportId) })
  }, [queryClient, reportId])

  useSocketEventEffect(lastByType, "team-invite", refresh)
  useSocketEventEffect(lastByType, "team-invite-closed", refresh)
  useSocketEventEffect(lastByType, "team-updated", refresh)
  useSocketEventEffect(lastByType, "user-removed", refresh)
  useSocketEventEffect(lastByType, "user-moved-to-observer", refresh)
  useSocketEventEffect(lastByType, "new-user", refresh)

  return query
}
