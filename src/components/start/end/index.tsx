"use client"

import Link from "next/link"
import { lazy, Suspense } from "react"
import { HomeIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import Spinner from "@/components/ui/spinner"
const UserScore = lazy(() => import("./UserScore"))
const GeneralTable = lazy(() => import("./GeneralTable"))
const PrizesWinnersBanner = lazy(() => import("./PrizesWinnersBanner"))

import { useAuthJwtClaims } from "@/lib/jwt"
import { getReportMyRole, type IReportByIdResponse } from "@/api/reports"
import { PHASE_SHELL_CLASS } from "@/components/start/lib/phase-shell"

interface IProps {
  data: IReportByIdResponse
  tgId: number
}

function StatusEnd({ data, tgId }: IProps) {
  const claims = useAuthJwtClaims()
  const isLeader = tgId === data?.user_id
  const isAdminManager = !!(claims?.is_admin || claims?.is_manager)

  const { data: myRole, isLoading: isLoadingMyRole } = useQuery({
    queryKey: ["report-my-role", data?.id, tgId],
    enabled: !!data?.id && !!tgId && isAdminManager && !isLeader,
    queryFn: () => getReportMyRole(data!.id),
  })

  const isObserver = myRole?.role === "observer"
  const showLeaderboard = isLeader || isObserver

  if (isLoadingMyRole)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner className="size-8 text-white/80" />
      </div>
    )

  return (
    <div className={PHASE_SHELL_CLASS}>
      <p className="glass-start-meta">игра завершена</p>
      <Suspense fallback={null}>
        <PrizesWinnersBanner reportId={data.id} tgId={tgId} elementAvatarId={data.element_avatar_id ?? null} />
      </Suspense>
      <section className="glass-start-liquid-palette w-full rounded-2xl p-3.5 sm:p-4">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">{showLeaderboard ? "Таблица рейтинга" : "Ваш результат"}</h2>
          <Link
            href="/"
            className="glass-start-slab inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-(--accent-orb)/50"
          >
            <HomeIcon className="size-3.5" aria-hidden />
            На главную
          </Link>
        </header>
        <Suspense fallback={null}>
          {showLeaderboard ? (
            <GeneralTable
              reportId={data.id}
              tgId={tgId}
              showLeaderboard={showLeaderboard}
              prizes={data.prizes ?? []}
              elementAvatarId={data.element_avatar_id ?? null}
            />
          ) : (
            <UserScore reportId={data.id} tgId={tgId} isLeader={isLeader} isObserver={isObserver} prizes={data.prizes ?? []} />
          )}
        </Suspense>
      </section>
      <div className="spacer-bottom-game" aria-hidden />
    </div>
  )
}

StatusEnd.displayName = "StatusEnd"
export default StatusEnd
