"use client"

import { useEffect, useMemo, useState } from "react"

function parseStartToMs(start: unknown): number | null {
  if (start instanceof Date) {
    const ms = start.getTime()
    return Number.isNaN(ms) ? null : ms
  }
  if (typeof start === "number" && Number.isFinite(start)) {
    return start < 1e12 ? start * 1000 : start
  }

  if (typeof start === "string") {
    const parsed = Date.parse(start)
    if (!Number.isNaN(parsed)) return parsed

    const isoMatch = start.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?Z?$/)
    if (isoMatch) {
      const [, y, m, d, h, min, sec, ms] = isoMatch
      const milliseconds = ms ? parseInt(ms.padEnd(3, "0")) : 0
      return Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(h), parseInt(min), parseInt(sec), milliseconds)
    }
  }
  return null
}

export function getRemainingSeconds(start: unknown, time: number): number {
  const total = Math.max(0, Math.floor(time || 0))
  if (!total) return 0

  const startMs = parseStartToMs(start)
  if (!startMs) return total

  const endMs = startMs + total * 1000
  return Math.max(0, Math.ceil((endMs - Date.now()) / 1000))
}

export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, seconds)
  const mm = Math.floor(safe / 60)
  const ss = safe % 60
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
}

interface IUseQuestionCountdownParams {
  start: unknown
  time: number
}

/** Обратный отсчёт вопроса от `start` + `time` (секунды). */
export function useQuestionCountdown({ start, time }: IUseQuestionCountdownParams) {
  const totalSeconds = useMemo(() => Math.max(0, Math.floor(time || 0)), [time])
  const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(start, totalSeconds))

  useEffect(() => {
    if (!totalSeconds) return

    const timer = setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(start, totalSeconds))
    }, 250)

    return () => clearInterval(timer)
  }, [start, totalSeconds])

  const ringProgress = totalSeconds ? remainingSeconds / totalSeconds : 0
  const ringAngle = ringProgress * 360

  return { totalSeconds, remainingSeconds, ringProgress, ringAngle }
}
