"use client"

import { useLayoutEffect } from "react"

import { resolveElementThemeId } from "@/constants/palette"
import { applyElementTheme } from "@/lib/orb-palette"
import { useAuth } from "@/stores/auth"
import { useElementThemeSession } from "@/stores/element-theme-session"

/** Синхронизирует `--orb-*` и `--accent-orb` со стихией аккаунта; в раунде — с ролью аватара игры. */
export function useSyncElementTheme() {
  const element = useAuth((s) => s.user?.element)
  const isGameAvatar = useElementThemeSession((s) => s.isGameAvatar)
  const themeId = resolveElementThemeId(element, isGameAvatar)

  useLayoutEffect(() => {
    applyElementTheme(themeId)
  }, [themeId])
}
