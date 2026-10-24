"use client"

import CurrentUserIdentity from "@/components/start/CurrentUserIdentity"
import { useAuthJwtClaims } from "@/lib/jwt"

export default function HomeIdentity() {
  const tgId = useAuthJwtClaims()?.telegram_id
  if (!tgId) return null
  return (
    <div className="game-liquid flex w-full flex-col gap-2 rounded-xl p-3 sm:p-3.5">
      <CurrentUserIdentity tgId={tgId} />
    </div>
  )
}
