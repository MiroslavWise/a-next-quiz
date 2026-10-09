"use client"

import { useQueryClient } from "@tanstack/react-query"
import { FingerprintPattern, Loader2Icon } from "lucide-react"
import { retrieveRawInitData, postEvent, isTMA } from "@tma.js/sdk"
import { Suspense, useCallback, useEffect, useState, type PropsWithChildren, lazy } from "react"

import Button from "@/components/ui/button"
import ToastHost from "@/components/ui/toast-host"
const ElementsUser = lazy(() => import("@/templates/elements-user"))
const UpdateInfoUser = lazy(() => import("@/templates/update-info-user"))

import { AuthStatus } from "@/enum/auth"
import { fetchUserByTgId } from "@/queries/user"
import { TELEGRAM_BOT_USERNAME } from "@/config/env"
import { useElementsUser } from "@/stores/elements-user"
import { postCheckDataUser } from "@/api/check-data-user"
import { useSyncElementTheme } from "@/hooks/use-sync-element-theme"
import { dispatchUpdateInfo, useUpdateInfo } from "@/stores/update-info"
import { dispatchAuth, dispatchUnauthenticated, useAuth } from "@/stores/auth"

const GlobalVerificationMainContext = ({ children }: PropsWithChildren) => {
  useSyncElementTheme()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const status = useAuth(({ status }) => status)
  const isOpen = useUpdateInfo(({ isOpen }) => isOpen)
  const isElementsOpen = useElementsUser(({ isOpen }) => isOpen)

  const handleRetryAuthorization = useCallback(async () => {
    isTMA("complete")
      .then(async (inTma) => {
        if (!inTma) {
          dispatchUnauthenticated()
        } else {
          const initDataRaw = retrieveRawInitData()
          if (!initDataRaw) {
            dispatchUnauthenticated()
            return
          }
          const check = await postCheckDataUser(initDataRaw)
          if (check.ok && check.token) {
            useAuth.setState({ token: check.token })

            const user = await fetchUserByTgId(queryClient, check.telegram_id)

            const needsProfileUpdate = !check.is_admin && !check.is_manager && (!user?.pseudo?.trim() || !user?.avatar?.trim())

            if (needsProfileUpdate) {
              dispatchUpdateInfo(user?.avatar ?? "", user?.pseudo ?? "", user?.bg ?? "")
            }

            dispatchAuth({ token: check.token, user })
          } else {
            dispatchUnauthenticated()
          }
        }
      })
      .catch(() => {
        dispatchUnauthenticated()
      })
  }, [queryClient])

  useEffect(() => {
    if (status === AuthStatus.PENDING) {
      handleRetryAuthorization()
    }
  }, [status])

  useEffect(() => {
    isTMA("complete").then((is) => {
      if (is) {
        try {
          // Mini Apps ≥ 7.7: отключить свайп вниз по контенту (шапку по-прежнему можно свайпнуть).
          postEvent("web_app_setup_swipe_behavior", { allow_vertical_swipe: false })
          postEvent("web_app_request_fullscreen")
        } catch {}
      } else {
        const url = `https://t.me/${TELEGRAM_BOT_USERNAME}`
        console.warn("ЗАЙДИ ЧЕРЕЗ Mini App: ", url)
      }
    })
  }, [])

  if (status === AuthStatus.PENDING) {
    return (
      <section
        className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 px-4 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="glass-start-meta">вход</p>
        <h2 className="text-xl font-semibold tracking-tight text-balance text-white sm:text-2xl">Проверяем доступ</h2>
        <span className="relative mt-2 flex size-11 items-center justify-center" aria-hidden>
          <span className="absolute inset-0 animate-ping rounded-full bg-(--accent-orb)/30" />
          <span className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-(--accent-orb) border-r-(--accent-orb)/45" />
          <span className="size-1.5 rounded-full bg-(--accent-orb) shadow-[0_0_12px_color-mix(in_srgb,var(--accent-orb)_80%,transparent)]" />
        </span>
      </section>
    )
  }

  if (status === AuthStatus.UNAUTHENTICATED) {
    return (
      <section className="bg-background flex min-h-dvh w-full items-center justify-center px-4">
        <div className="border-border bg-card flex w-full max-w-sm flex-col gap-4 rounded-2xl border p-6 text-left">
          <h2 className="text-foreground text-base font-semibold tracking-tight">Вы не авторизованы</h2>
          <p className="text-muted-foreground text-xs">Откройте мини‑приложение из Telegram или выполните вход, чтобы продолжить.</p>
          <Button
            type="button"
            size="sm"
            className="inline-flex items-center gap-1.5"
            disabled={loading}
            onClick={async () => {
              if (loading) return
              setLoading(true)
              try {
                await handleRetryAuthorization()
              } finally {
                setLoading(false)
              }
            }}
          >
            {loading ? <Loader2Icon className="size-4 animate-spin" /> : <FingerprintPattern className="size-4" />}
            <span>Повторить авторизацию</span>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <>
      {children}
      <ToastHost />
      <Suspense fallback={null}>{isOpen && <UpdateInfoUser />}</Suspense>
      <Suspense fallback={null}>{isElementsOpen && <ElementsUser />}</Suspense>
    </>
  )
}

export default ({ children }: PropsWithChildren) => <GlobalVerificationMainContext>{children}</GlobalVerificationMainContext>
