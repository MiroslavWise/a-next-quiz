"use client"

import { Suspense, lazy } from "react"

import Skeleton from "@/components/ui/skeleton"
import { useAuthJwtClaims } from "@/lib/jwt"

const ButtonToGameMechanics = lazy(() => import("@/components/common/button-to-game-mechanics"))

function ButtonToGameMechanicsSkeleton() {
  return (
    <div className="flex h-auto items-center justify-between overflow-hidden rounded-2xl border border-(--orb-border-one)/35 bg-(--orb-bg-one)/8 px-4 py-3">
      <span className="flex min-w-0 items-center gap-3">
        <Skeleton className="bg-background/60 size-9 shrink-0 rounded-xl border border-(--orb-border-one)/25" />
        <span className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-44 max-w-[56vw] bg-white/12" />
          <Skeleton className="h-3 w-64 max-w-[62vw] bg-white/8" />
        </span>
      </span>
      <Skeleton className="size-4 shrink-0 rounded-full bg-white/10" />
    </div>
  )
}

/** Ссылка на механику скрыта у админов (есть в footer). */
export default function HomeMechanicsLink() {
  const isAdmin = useAuthJwtClaims()?.is_admin ?? false
  if (isAdmin) return null
  return (
    <Suspense fallback={<ButtonToGameMechanicsSkeleton />}>
      <ButtonToGameMechanics />
    </Suspense>
  )
}
