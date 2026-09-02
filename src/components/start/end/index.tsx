"use client"

import Link from "next/link"
import { lazy, Suspense } from "react"
import { HomeIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import Button from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
const UserScore = lazy(() => import("./UserScore"))
const GeneralTable = lazy(() => import("./GeneralTable"))
const PrizesWinnersBanner = lazy(() => import("./PrizesWinnersBanner"))

import { cn } from "@/lib/utils"
import { useAuthJwtClaims } from "@/lib/jwt"
import { getReportMyRole, type IReportByIdResponse } from "@/api/reports"

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
    <div className="flex h-full max-h-screen w-full flex-col items-center gap-4 overflow-x-hidden overflow-y-auto px-4 pt-12 pb-12 [-webkit-overflow-scrolling:touch]">
      <Suspense fallback={null}>
        <div className="container w-full">
          <PrizesWinnersBanner reportId={data.id} tgId={tgId} elementAvatarId={data.element_avatar_id ?? null} />
        </div>
      </Suspense>
      <section
        className={cn(
          "container",
          showLeaderboard ? "py-4 sm:py-5" : "glass-start-liquid-palette rounded-xl border border-white/15 p-4 sm:p-5",
        )}
      >
        <header className={cn("flex items-center justify-between gap-3", showLeaderboard && "mb-2")}>
          <h2 className="text-base font-semibold text-white">{showLeaderboard ? "Таблица рейтинга" : "Ваш результат"}</h2>
          <Button asChild variant="outline" size="sm" className="border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white">
            <Link href="/">
              <HomeIcon className="size-3.5" aria-hidden />
              На главную
            </Link>
          </Button>
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
    </div>
  )
}

StatusEnd.displayName = "StatusEnd"
export default StatusEnd
