"use client"

import { useRouter } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { useEffect, useRef, useState } from "react"

import { decodeStartParam, retrieveLaunchParams } from "@tma.js/sdk"

import Button from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

import { useAuth } from "@/stores/auth"
import { AuthStatus } from "@/enum/auth"
import { useAuthJwtClaims } from "@/lib/jwt"
import { EReportStatus } from "@/enum/report"
import { useUpdateInfo } from "@/stores/update-info"
import { addMemberToReport, getReportByCode } from "@/api/reports"

/** OTP-вход по коду + обработка tgWebAppStartParam. */
export default function HomeJoinByCode() {
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id
  const router = useRouter()
  const { authStatus, authUser } = useAuth(useShallow((s) => ({ authStatus: s.status, authUser: s.user })))
  const [code, setCode] = useState("")
  const [isAwaitingReportByCode, setIsAwaitingReportByCode] = useState(false)
  const [rawStartParam, setRawStartParam] = useState<string | undefined>(undefined)
  const isComplete = code.length === 6
  const isOpen = useUpdateInfo(({ isOpen }) => isOpen)
  const handledStartParamRef = useRef<string | null>(null)

  useEffect(() => {
    try {
      const { tgWebAppStartParam } = retrieveLaunchParams()
      setRawStartParam(tgWebAppStartParam)
    } catch {
      setRawStartParam(undefined)
    }
  }, [])

  const navigateByCode = async (codeValue: string) => {
    if (!tgId) return
    if (!/^\d{6}$/.test(codeValue)) return
    if (isAwaitingReportByCode) return

    try {
      setIsAwaitingReportByCode(true)
      const res = await getReportByCode(codeValue)

      if (!!res?.status && [EReportStatus.WAITING, EReportStatus.START, EReportStatus.CHECKING, EReportStatus.GAME].includes(res?.status)) {
        if (res?.status === EReportStatus.WAITING) {
          await addMemberToReport(res?.id?.toString() ?? "")
        }
        requestAnimationFrame(() => {
          router.replace(`/start/${res?.id}`)
        })
      } else {
        console.warn("Квиз не найден")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsAwaitingReportByCode(false)
    }
  }

  const setQuickAccessCodeFromOtp = (value: string) => {
    const numeric = value.replace(/\D/g, "").slice(0, 6)
    setCode(numeric)
  }

  const handleSubmit = async () => {
    if (!isComplete || isAwaitingReportByCode) return
    await navigateByCode(code)
  }

  useEffect(() => {
    if (!rawStartParam || !tgId) return
    if (authStatus !== AuthStatus.AUTHENTICATED) return
    if (isOpen) return

    const isAdminManager = !!(claims?.is_admin || claims?.is_manager)
    const hasProfile = !!authUser?.pseudo?.trim() && !!authUser?.avatar?.trim()
    if (!isAdminManager && !hasProfile) return

    if (handledStartParamRef.current === rawStartParam) return
    handledStartParamRef.current = rawStartParam

    const run = async () => {
      if (/^\d{6}$/.test(rawStartParam)) {
        await navigateByCode(rawStartParam)
        return
      }

      try {
        const decoded = decodeStartParam(rawStartParam, "json") as unknown
        if (!decoded || typeof decoded !== "object") return

        const payload = decoded as { code?: unknown; reportId?: unknown }

        const codeValue = typeof payload.code === "string" ? payload.code : undefined
        if (codeValue && /^\d{6}$/.test(codeValue)) {
          await navigateByCode(codeValue)
          return
        }

        const reportIdValue = typeof payload.reportId === "string" || typeof payload.reportId === "number" ? payload.reportId : undefined
        if (reportIdValue !== undefined) {
          requestAnimationFrame(() => {
            router.replace(`/start/${reportIdValue}`)
          })
        }
      } catch (e) {
        console.warn("Не удалось декодировать start_param:", e)
      }
    }

    void run()
  }, [rawStartParam, tgId, authStatus, isOpen, claims?.is_admin, claims?.is_manager, authUser?.pseudo, authUser?.avatar])

  const otpSlotClass =
    "size-9 rounded-md border-2 border-black/80 bg-black/40 text-sm font-bold shadow-[3px_3px_0_0_#0a0c0b] first:rounded-md first:border-l-2 last:rounded-md data-[active=true]:border-(--accent-orb) data-[active=true]:ring-0 data-[active=true]:shadow-[3px_3px_0_0_color-mix(in_srgb,var(--accent-orb)_55%,#0a0c0b)]"

  return (
    <div className="game-liquid mt-auto flex flex-col items-center justify-center rounded-xl px-4 py-6 sm:px-6">
      <p className="game-meta mb-4">Перейти по коду</p>
      <InputOTP
        maxLength={6}
        value={code}
        onChange={setQuickAccessCodeFromOtp}
        containerClassName="gap-2.5"
        onComplete={handleSubmit}
        inputMode="numeric"
        pattern="\d*"
        disabled={isAwaitingReportByCode}
      >
        <InputOTPGroup className="rounded-md">
          <InputOTPSlot index={0} className={otpSlotClass} />
        </InputOTPGroup>
        <InputOTPGroup className="rounded-md">
          <InputOTPSlot index={1} className={otpSlotClass} />
        </InputOTPGroup>
        <InputOTPGroup className="rounded-md">
          <InputOTPSlot index={2} className={otpSlotClass} />
        </InputOTPGroup>
        <InputOTPGroup className="rounded-md">
          <InputOTPSlot index={3} className={otpSlotClass} />
        </InputOTPGroup>
        <InputOTPGroup className="rounded-md">
          <InputOTPSlot index={4} className={otpSlotClass} />
        </InputOTPGroup>
        <InputOTPGroup className="rounded-md">
          <InputOTPSlot index={5} className={otpSlotClass} />
        </InputOTPGroup>
      </InputOTP>
      <Button
        type="button"
        className="game-btn-primary mt-4 h-11 min-w-44 rounded-xl font-bold"
        disabled={!isComplete || isAwaitingReportByCode}
        onClick={handleSubmit}
      >
        Перейти к квизу
      </Button>
    </div>
  )
}
