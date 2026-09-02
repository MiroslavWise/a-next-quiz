"use client"

import { lazy, Suspense } from "react"
import { Pencil } from "lucide-react"

import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/auth"
import { useUserByTgId } from "@/queries/user"
import { dispatchUpdateInfo } from "@/stores/update-info"

const ElementsUserButton = lazy(() => import("@/components/common/ElementsUserButton"))

const IDENTITY_ELEMENTS_BUTTON_CLASS = cn(
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background",
  "transition-colors hover:bg-muted hover:text-foreground",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
  "disabled:pointer-events-none disabled:opacity-50",
)

export default function CurrentUserIdentity({
  tgId,
  showPseudo = true,
  showPhotoOverlay = true,
}: {
  tgId: number
  showPseudo?: boolean
  showPhotoOverlay?: boolean
}) {
  const user = useAuth(({ user }) => user)

  const { data, isLoading } = useUserByTgId(tgId)

  const pseudo = data?.pseudo?.trim() || `Пользователь ${tgId}`
  const fullName = [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim()
  const avatar = data?.avatar
  const photoUrl = data?.photo_url
  const bg = data?.bg ?? ""

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full" />
        {showPseudo ? <Skeleton className="h-5 w-40 rounded-md" /> : null}
      </div>
    )
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <UserAvatar
        variant="identity"
        avatar={avatar}
        bg={bg}
        pseudo={pseudo}
        photoUrl={photoUrl}
        element={data?.element}
        photoOverlay={showPhotoOverlay ? "always" : "never"}
      />

      {showPseudo ? (
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">
            {pseudo}
            {fullName ? <span className="text-muted-foreground ml-1 text-xs font-normal">({fullName})</span> : null}
          </p>
        </div>
      ) : null}

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={!user}
          onClick={() => {
            dispatchUpdateInfo(avatar ?? "", pseudo ?? fullName ?? "", bg ?? "")
          }}
          aria-label="Изменить профиль"
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Suspense fallback={<Skeleton className="size-8 shrink-0 rounded-lg" aria-hidden />}>
          <ElementsUserButton className={IDENTITY_ELEMENTS_BUTTON_CLASS} disabled={!user} element={data?.element} />
        </Suspense>
      </div>
    </div>
  )
}

CurrentUserIdentity.displayName = "CurrentUserIdentity"
