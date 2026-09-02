"use client"

import { useMemo } from "react"

import { useAuth } from "@/stores/auth"

/** Claims JWT, выдаваемого бэкендом после `/check-data-user`. */
export interface JwtClaims {
  exp: number
  iat: number
  is_admin: boolean
  is_manager: boolean
  ok: boolean
  telegram_id: number
}

function parseJwtClaims(raw: unknown): JwtClaims | null {
  if (!raw || typeof raw !== "object") return null

  const payload = raw as Record<string, unknown>

  if (
    typeof payload.exp !== "number" ||
    typeof payload.iat !== "number" ||
    typeof payload.is_admin !== "boolean" ||
    typeof payload.is_manager !== "boolean" ||
    typeof payload.ok !== "boolean" ||
    typeof payload.telegram_id !== "number"
  ) {
    return null
  }

  return {
    exp: payload.exp,
    iat: payload.iat,
    is_admin: payload.is_admin,
    is_manager: payload.is_manager,
    ok: payload.ok,
    telegram_id: payload.telegram_id,
  }
}

/** Декодирует payload JWT без проверки подписи. */
export function decodeJwtPayload(token: string): JwtClaims | null {
  const parts = token.split(".")
  if (parts.length < 2) return null

  try {
    const base64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    return parseJwtClaims(JSON.parse(atob(padded)))
  } catch {
    return null
  }
}

/** Текущие claims из токена в `useAuth` (или `null`, если токена нет / payload невалиден). */
export function getAuthJwtClaims(): JwtClaims | null {
  const { token } = useAuth.getState()
  if (!token) return null
  return decodeJwtPayload(token)
}

export function getAuthTelegramId(): number | undefined {
  return getAuthJwtClaims()?.telegram_id
}

export function getAuthIsAdmin(): boolean {
  return getAuthJwtClaims()?.is_admin ?? false
}

export function getAuthIsManager(): boolean {
  return getAuthJwtClaims()?.is_manager ?? false
}

export function getAuthIsAdminOrManager(): boolean {
  const claims = getAuthJwtClaims()
  return !!(claims?.is_admin || claims?.is_manager)
}

/** Реактивные claims для компонентов (подписка на `token` в `useAuth`). */
export function useAuthJwtClaims(): JwtClaims | null {
  const token = useAuth(({ token }) => token)
  return useMemo(() => (token ? decodeJwtPayload(token) : null), [token])
}
