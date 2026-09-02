"use client"

import CurrentUserIdentity from "@/components/start/CurrentUserIdentity"
import { useAuthJwtClaims } from "@/lib/jwt"

export default function HomeIdentity() {
  const tgId = useAuthJwtClaims()?.telegram_id
  if (!tgId) return null
  return (
    <div className="flex w-full flex-col gap-2">
      <CurrentUserIdentity tgId={tgId} />
    </div>
  )
}
