"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, DatabaseZap, Users } from "lucide-react"
import { on, off, postEvent, type PopupButton } from "@tma.js/sdk"

import Button from "@/components/ui/button"
import AppPageHeaders from "@/components/common/AppPageHeaders"
import Skeleton from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/common/UserAvatar"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"

import { useAuthJwtClaims } from "@/lib/jwt"
import { getStaffRoles } from "@/api/staff-roles"
import type { IStaffRoleEntry } from "@/interface/staff"
import { postAdminCacheReset } from "@/api/admin-cache-reset"

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

export default function AdminStaffPage() {
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id
  const isAdmin = claims?.is_admin ?? false
  const [cacheResetLoading, setCacheResetLoading] = useState(false)

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["staff-roles"],
    enabled: !!tgId && isAdmin,
    queryFn: getStaffRoles,
  })

  function openCacheResetConfirm() {
    if (!tgId || cacheResetLoading) return
    const buttons: PopupButton[] = [
      { id: "admin_cache_reset", text: "Сбросить", type: "destructive" },
      { id: "cancel", type: "cancel" },
    ]
    postEvent("web_app_open_popup", {
      title: "Сбросить кэш сервера?",
      message:
        "Будут очищены in-memory кэши (ответы, full-quiz, очки, отчёты и т.д.). Используйте после ручных правок в обход API или при рассинхронизации. Во время активной игры — с осторожностью.",
      buttons,
    })
  }

  useEffect(() => {
    if (!isAdmin || !tgId) return

    function handlePopupClosed(event: { button_id?: string }) {
      if (event.button_id !== "admin_cache_reset") return
      setCacheResetLoading(true)
      void postAdminCacheReset()
        .then((res) => {
          console.info("Кэш сброшен", res.cleared?.length ? `Очищено подсистем: ${res.cleared.length}` : "")
        })
        .catch((e) => {
          console.error(e)
        })
        .finally(() => setCacheResetLoading(false))
    }

    on("popup_closed", handlePopupClosed)
    return () => off("popup_closed", handlePopupClosed)
  }, [isAdmin, tgId])

  if (!isAdmin) {
    return (
      <section className="flex w-full flex-col gap-4 pt-5">
        <header className="border-border -mx-4 flex w-[calc(100%+2rem)] items-center gap-3 border-y p-4">
          <Button asChild variant="outline" size="icon" aria-label="Назад">
            <Link href="/">
              <ArrowLeft className="size-3.5" />
            </Link>
          </Button>
          <h2 className="text-lg font-semibold tracking-tight">Команда</h2>
        </header>
        <div className="border-border rounded-xl border border-dashed p-4 text-center">
          <p className="text-muted-foreground text-sm">Раздел доступен только администраторам.</p>
          <Button asChild variant="outline" className="mt-3">
            <Link href="/admin">К списку квизов</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col pt-5">
      <AppPageHeaders
        title="Команда"
        description="Администраторы и менеджеры из конфигурации сервера"
        toolbarTitle="Роли"
        accent="three"
        backTo="/admin"
        backAriaLabel="Назад к админке"
      />
      <div className="flex w-full flex-col gap-8 py-4">
        {isFetching ? (
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
        ) : isError ? (
          <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed p-4 text-center">
            <Users className="text-muted-foreground size-8" aria-hidden />
            <p className="text-muted-foreground text-sm">{error instanceof Error ? error.message : "Не удалось загрузить"}</p>
            <Button asChild variant="outline">
              <Link href="/admin">К списку квизов</Link>
            </Button>
          </div>
        ) : data ? (
          <>
            <StaffSection title="Администраторы" entries={data.admins} />
            <StaffSection title="Менеджеры" entries={data.managers} />
            <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-xl border p-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-foreground text-sm font-semibold tracking-tight">Кэш сервера</h3>
                <p className="text-muted-foreground text-xs">Полный сброс процессных кэшей на бэкенде. Доступно только администраторам.</p>
              </div>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                disabled={cacheResetLoading}
                onClick={openCacheResetConfirm}
              >
                <DatabaseZap className="size-4" aria-hidden />
                Сбросить кэш
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
