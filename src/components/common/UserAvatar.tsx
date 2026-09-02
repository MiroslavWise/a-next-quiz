import { type DispatchWithoutAction, type ReactNode, type CSSProperties } from "react"

import Skeleton from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import type { EUserElement } from "@/enum/element"
import { useShowDataUser } from "@/hooks/use-show-data-user"
import { GAME_AVATAR_ICON_SRC, GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"

export function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase()
  return name.slice(0, 2).toUpperCase() || "?"
}

export function userProfileAdminSubtitle(data?: { first_name?: string | null; last_name?: string | null; username?: string | null }) {
  const fullName = [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim()
  return fullName || (data?.username ?? "")
}

export type UserAvatarPhotoOverlay = "admin-toggle" | "admin-only" | "always" | "never"

/** Фото (справа снизу) и стихия (слева снизу) — 1/3 стороны аватара. */
const AVATAR_CORNER_BADGE_SIZE = "block h-1/3 w-1/3"
/** Аватар и слой бейджей в одной ячейке grid — проценты считаются от реального размера круга. */
const AVATAR_STACK_CLASS = "relative inline-grid shrink-0"

function avatarCornerBadgeClass(side: "left" | "right", extra?: string) {
  return cn(
    "pointer-events-none absolute bottom-0 z-10 box-border overflow-hidden rounded-full border-2",
    AVATAR_CORNER_BADGE_SIZE,
    side === "left" ? "left-0" : "right-0",
    extra,
  )
}

function AvatarCornerBadge({
  side,
  className,
  style,
  children,
}: {
  side: "left" | "right"
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <span className={avatarCornerBadgeClass(side, className)} style={style} aria-hidden>
      {children}
    </span>
  )
}

export type UserAvatarVariant =
  | "report"
  | "identity"
  | "leader"
  | "waiting"
  | "waiting-profile"
  | "podium"
  | "emoji"
  | "leaderboard"
  | "staff"
  | "footer"

function usePhotoOverlayVisible(mode: UserAvatarPhotoOverlay, photoUrl?: string | null) {
  const showAdminUserData = useShowDataUser()

  if (!photoUrl?.trim()) return false

  switch (mode) {
    case "never":
      return false
    case "always":
      return true
    case "admin-only":
    case "admin-toggle":
    default:
      return showAdminUserData
  }
}

const variantStyles: Record<
  UserAvatarVariant,
  {
    root: string
    fallback: string
    overlayBorder: string
    overlayPlacement: "sibling" | "nested"
    defaultPhotoOverlay: UserAvatarPhotoOverlay
  }
> = {
  report: {
    root: "bg-muted/50 size-11 border",
    fallback: "",
    overlayBorder: "border-background",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "admin-toggle",
  },
  identity: {
    root: "size-11 border bg-muted/50",
    fallback: "",
    overlayBorder: "border-background",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "always",
  },
  leader: {
    root: "size-10 border border-white/20 bg-white/10",
    fallback: "text-xs text-white",
    overlayBorder: "border-white/30",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "admin-toggle",
  },
  waiting: {
    root: "size-12 border sm:size-13 md:size-14",
    fallback: "bg-white/15 text-sm font-medium text-white/95",
    overlayBorder: "border-white/30",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "admin-toggle",
  },
  "waiting-profile": {
    root: "size-11 shrink-0 border-2 sm:size-12",
    fallback: "bg-white/12 text-sm font-semibold text-white/90 sm:text-base",
    overlayBorder: "border-background",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "always",
  },
  podium: {
    root: "relative z-10 size-16 border border-white/20 xl:size-20 2xl:size-24",
    fallback: "text-sm font-bold xl:text-base 2xl:text-lg",
    overlayBorder: "border-background bg-transparent",
    overlayPlacement: "nested",
    defaultPhotoOverlay: "admin-toggle",
  },
  emoji: {
    root: "ring-background/80 ring-1.5 size-5",
    fallback: "text-[9px] font-semibold",
    overlayBorder: "",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "never",
  },
  leaderboard: {
    root: "size-9 border-2 ring-offset-1 ring-offset-black/50",
    fallback: "bg-white/12 text-[0.65rem] font-semibold text-white/90",
    overlayBorder: "",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "never",
  },
  footer: {
    root: "size-10 border ring-offset-1 ring-offset-black/50",
    fallback: "bg-white/12 text-[0.65rem] font-semibold text-white/90",
    overlayBorder: "",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "never",
  },
  staff: {
    root: "size-9 border border-border bg-muted/40",
    fallback: "text-xs font-medium",
    overlayBorder: "border-background",
    overlayPlacement: "sibling",
    defaultPhotoOverlay: "always",
  },
}

function elementBadgeClassForVariant(variant: UserAvatarVariant): boolean {
  switch (variant) {
    case "emoji":
    case "leaderboard":
    case "footer":
      return false
    default:
      return true
  }
}

function UserElementBadge({
  variant,
  element,
  badgeClassName,
}: {
  variant: UserAvatarVariant
  element?: EUserElement | null
  badgeClassName?: string
}) {
  if (!elementBadgeClassForVariant(variant) || !element) return null

  const visual = GAME_ELEMENT_VISUAL_BY_ID[element]
  if (!visual) return null

  return (
    <AvatarCornerBadge
      side="left"
      className={cn("border-background isolate bg-white", badgeClassName)}
      style={{ borderColor: visual.accentColor }}
    >
      <span className="flex size-full items-center justify-center p-[18%]">
        <img src={visual.iconSrc} alt="" className="size-full object-contain" draggable={false} />
      </span>
    </AvatarCornerBadge>
  )
}

function UserGameAvatarBadge({ variant, badgeClassName }: { variant: UserAvatarVariant; badgeClassName?: string }) {
  if (!elementBadgeClassForVariant(variant)) return null

  return (
    <span
      className={cn(
        // Как бейдж стихии: сплошной фон. Полупрозрачный + белый круг из elements.svg = «призрак» на мелком аватаре.
        "pointer-events-none absolute top-0 right-0 z-10 box-border overflow-hidden rounded-full border-2 border-background isolate bg-white p-[10%]",
        AVATAR_CORNER_BADGE_SIZE,
        badgeClassName,
      )}
      style={{ borderColor: "var(--accent-orb, #818cf8)" }}
      title="Аватар игры"
      aria-hidden
    >
      <img src={GAME_AVATAR_ICON_SRC} alt="" className="size-full object-contain" draggable={false} />
    </span>
  )
}

export interface UserAvatarProps {
  avatar?: string | null
  bg?: string | null
  pseudo?: string
  photoUrl?: string | null
  variant?: UserAvatarVariant
  photoOverlay?: UserAvatarPhotoOverlay
  className?: string
  fallbackClassName?: string
  overlayClassName?: string
  imageClassName?: string
  reducedEffects?: boolean
  alt?: string
  title?: string
  radixSize?: "default" | "sm" | "lg"
  wrapperClassName?: string
  /** Без внешней обёртки `relative shrink-0` (если позиционирование задаёт родитель). */
  bare?: boolean
  /** Стихия из профиля — слева снизу, если задана. */
  element?: EUserElement | null
  /** Аватар игры в этом отчёте (`element_avatar_id`) — справа сверху, независимо от стихии. */
  isGameAvatar?: boolean
  /** Переопределяет размер бейджа стихии / аватара игры (например, при уменьшенном аватаре). */
  elementBadgeClassName?: string
  onClick?: DispatchWithoutAction
}

export function UserAvatar({
  avatar,
  bg,
  pseudo = "",
  photoUrl,
  variant = "report",
  photoOverlay,
  className,
  fallbackClassName,
  overlayClassName,
  imageClassName,
  alt = "",
  title,
  radixSize,
  wrapperClassName,
  bare = false,
  element,
  isGameAvatar = false,
  elementBadgeClassName,
  onClick,
}: UserAvatarProps) {
  const styles = variantStyles[variant]
  const overlayMode = photoOverlay ?? styles.defaultPhotoOverlay
  const showOverlay = usePhotoOverlayVisible(overlayMode, photoUrl)
  const bgColor = bg?.trim() || "transparent"

  const elementBadge = <UserElementBadge variant={variant} element={element} badgeClassName={elementBadgeClassName} />
  const gameAvatarBadge = isGameAvatar ? <UserGameAvatarBadge variant={variant} badgeClassName={elementBadgeClassName} /> : null

  const overlayAvatar =
    showOverlay && styles.overlayBorder ? (
      <AvatarCornerBadge side="right" className={cn(styles.overlayBorder, overlayClassName)}>
        <img src={photoUrl!.trim()} alt="" className={cn("size-full object-cover", imageClassName)} draggable={false} />
      </AvatarCornerBadge>
    ) : null

  const cornerBadgesLayer = (
    <div className="pointer-events-none col-start-1 row-start-1 size-full min-h-0 min-w-0">
      {styles.overlayPlacement === "sibling" ? overlayAvatar : null}
      {elementBadge}
      {gameAvatarBadge}
    </div>
  )

  const mainAvatar = (
    <Avatar
      size={radixSize ?? (variant === "emoji" ? "sm" : undefined)}
      className={cn(styles.root, className, "cursor-pointer")}
      style={{ backgroundColor: bgColor }}
      title={title}
      onClick={onClick}
    >
      {avatar?.trim() ? <AvatarImage src={avatar.trim()} alt={alt || pseudo} className={cn("object-cover", imageClassName)} /> : null}
      <AvatarFallback
        className={cn(styles.fallback, fallbackClassName)}
        style={variant === "emoji" ? { backgroundColor: bgColor } : undefined}
      >
        {userInitials(pseudo)}
      </AvatarFallback>
      {styles.overlayPlacement === "nested" ? overlayAvatar : null}
    </Avatar>
  )

  if (bare) {
    const stack = (
      <>
        <div className="col-start-1 row-start-1">{mainAvatar}</div>
        {cornerBadgesLayer}
      </>
    )
    return wrapperClassName ? <div className={cn(AVATAR_STACK_CLASS, wrapperClassName)}>{stack}</div> : stack
  }

  return (
    <div className={cn(AVATAR_STACK_CLASS, "cursor-pointer", wrapperClassName)}>
      <div className="col-start-1 row-start-1">{mainAvatar}</div>
      {cornerBadgesLayer}
    </div>
  )
}

export interface UserAvatarByIdProps extends Omit<UserAvatarProps, "avatar" | "bg" | "pseudo" | "photoUrl"> {
  telegramId: number
  viewerTgId?: number
  pseudoFallback?: (telegramId: number) => string
  loadingClassName?: string
  loading?: ReactNode
}

export function UserAvatarById({
  telegramId,
  viewerTgId,
  pseudoFallback,
  loadingClassName,
  loading,
  element: elementOverride,
  ...avatarProps
}: UserAvatarByIdProps) {
  const { data, isLoading } = useUserByTgId(telegramId, {
    enabled: !!telegramId && (viewerTgId === undefined ? true : !!viewerTgId),
  })

  if (isLoading) {
    return loading ?? <Skeleton className={cn("rounded-full", loadingClassName ?? "size-11")} />
  }

  const pseudo = data?.pseudo?.trim() || (pseudoFallback ? pseudoFallback(telegramId) : `Пользователь ${telegramId}`)
  const bg = data?.bg ?? ""
  const avatar = data?.avatar ?? ""
  const photoUrl = data?.photo_url ?? ""
  const title = avatarProps.title ?? pseudo
  const element = elementOverride ?? data?.element ?? null

  return <UserAvatar {...avatarProps} pseudo={pseudo} bg={bg} avatar={avatar} photoUrl={photoUrl} title={title} element={element} />
}
