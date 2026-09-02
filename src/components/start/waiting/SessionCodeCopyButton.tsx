"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

import styles from "./waiting.module.scss"

const COPIED_FEEDBACK_MS = 2_000

type SessionCodeCopyButtonProps = {
  code: string
  textToCopy: string
  className?: string
}

function SessionCodeCopyButton({ code, textToCopy, className }: SessionCodeCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => {
        setCopied(false)
        resetTimerRef.current = null
      }, COPIED_FEEDBACK_MS)
    } catch (error) {
      console.error(error)
    }
  }, [textToCopy])

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Код скопирован" : "Скопировать код сессии"}
      aria-label={copied ? "Код сессии скопирован" : "Скопировать шестизначный код сессии"}
      className={className}
    >
      <span className={cn("select-all", styles.sessionCode)} data-text={code}>
        {code}
      </span>
      {copied ? (
        <Check className="size-3 shrink-0 text-emerald-400/90" aria-hidden />
      ) : (
        <Copy className="size-3 shrink-0 text-white/45" aria-hidden />
      )}
    </button>
  )
}

SessionCodeCopyButton.displayName = "SessionCodeCopyButton"
export default SessionCodeCopyButton
