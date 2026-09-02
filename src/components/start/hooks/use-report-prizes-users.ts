"use client"

import { useQuery } from "@tanstack/react-query"

import { ApiRequestError } from "@/api/errors"
import { getReportPrizesUsers } from "@/api/reports"

export const reportPrizesUsersQueryKey = (reportId: string | number) => ["report-prizes-users", reportId] as const

interface IUseReportPrizesUsersParams {
  reportId: string | number
  enabled?: boolean
}

/** Список призёров после завершения игры (`GET /report/{id}/prizes-users`, статус отчёта END). */
export function useReportPrizesUsers({ reportId, enabled = true }: IUseReportPrizesUsersParams) {
  return useQuery({
    queryKey: reportPrizesUsersQueryKey(reportId),
    queryFn: () => getReportPrizesUsers(reportId),
    enabled: enabled && !!reportId,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (ApiRequestError.is(error) && error.status === 409) return false
      return failureCount < 2
    },
  })
}
