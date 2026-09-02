"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"

import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/common/UserAvatar"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"

import { useAuthJwtClaims } from "@/lib/jwt"
import { getStaffRoles } from "@/api/staff-roles"
import type { IStaffRoleEntry } from "@/interface/staff"

function StaffRow({ entry }: { entry: IStaffRoleEntry }) {
  const u = entry.user
  const title = u?.pseudo?.trim() || [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim() || null
  const fullName = [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim()
  const pseudo = fullName || u?.pseudo?.trim() || "?"

  return (
    <Item variant="outline" role="listitem">
      <ItemMedia variant="image">
        <UserAvatar variant="staff" avatar={u?.avatar} bg={u?.bg} pseudo={pseudo} photoUrl={u?.photo_url} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-1">{title ?? "Нет в базе"}</ItemTitle>
        {fullName ? (
          <ItemDescription className="text-muted-foreground text-xs">{fullName}</ItemDescription>
        ) : (
          <ItemDescription className="text-muted-foreground font-mono text-xs">ID {entry.telegram_id}</ItemDescription>
        )}
        {u?.username ? <ItemDescription className="text-muted-foreground text-xs">@{u.username}</ItemDescription> : null}
      </ItemContent>
    </Item>
  )
}

function StaffSection({ title, entries }: { title: string; entries: IStaffRoleEntry[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-foreground text-sm font-semibold tracking-tight">{title}</h3>
      {entries.length > 0 ? (
        <ItemGroup className="gap-2">
          {entries.map((entry) => (
            <StaffRow key={`${title}-${entry.telegram_id}`} entry={entry} />
          ))}
        </ItemGroup>
      ) : (
        <p className="text-muted-foreground text-xs">Список пуст.</p>
      )}
    </div>
  )
}

/** Список админов/менеджеров с API (react-query). */
export default function StaffRolesPanel() {
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id
  const isAdmin = claims?.is_admin ?? false

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["staff-roles"],
    enabled: !!tgId && isAdmin,
    queryFn: getStaffRoles,
  })

  if (isFetching) {
    return (
      <ItemGroup className="gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex w-full items-center gap-4">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </ItemGroup>
    )
  }

  if (isError) {
    return (
      <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed p-4 text-center">
        <Users className="text-muted-foreground size-8" aria-hidden />
        <p className="text-muted-foreground text-sm">{error instanceof Error ? error.message : "Не удалось загрузить"}</p>
        <Button asChild variant="outline">
          <Link href="/admin">К списку квизов</Link>
        </Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <>
      <StaffSection title="Администраторы" entries={data.admins} />
      <StaffSection title="Менеджеры" entries={data.managers} />
    </>
  )
}
