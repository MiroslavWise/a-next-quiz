"use client"

import { useEffect, useState } from "react"
import { DatabaseZap } from "lucide-react"
import { on, off, postEvent, type PopupButton } from "@tma.js/sdk"

import Button from "@/components/ui/button"

import { useAuthJwtClaims } from "@/lib/jwt"
import { postAdminCacheReset } from "@/api/admin-cache-reset"

/** Сброс серверного кэша через TMA popup. */
export default function AdminCacheReset() {
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id
  const isAdmin = claims?.is_admin ?? false
  const [cacheResetLoading, setCacheResetLoading] = useState(false)

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

  if (!isAdmin) return null

  return (
    <div className="game-slab flex flex-col gap-3 rounded-lg border-(--unfaithful)/60 p-4 shadow-[4px_4px_0_0_color-mix(in_srgb,var(--unfaithful)_45%,#0a0c0b)]">
      <div className="flex flex-col gap-1">
        <p className="text-[0.65rem] font-bold tracking-[0.18em] text-(--unfaithful) uppercase">опасно</p>
        <h3 className="text-sm font-bold tracking-tight text-white">Кэш сервера</h3>
        <p className="text-xs text-white/60">Полный сброс процессных кэшей на бэкенде. Доступно только администраторам.</p>
      </div>
      <Button
        type="button"
        className="h-11 w-full rounded-lg border-2 border-black/80 bg-(--unfaithful)/85 font-bold text-white shadow-[4px_4px_0_0_#0a0c0b] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-(--unfaithful) hover:shadow-[2px_2px_0_0_#0a0c0b] sm:w-auto"
        disabled={cacheResetLoading}
        onClick={openCacheResetConfirm}
      >
        <DatabaseZap className="size-4" aria-hidden />
        Сбросить кэш
      </Button>
    </div>
  )
}
