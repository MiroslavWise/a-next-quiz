"use client"

import { create } from "zustand"

type ToastState = {
  message: string | null
  timeoutId: ReturnType<typeof setTimeout> | null
}

export const useToast = create<ToastState>(() => ({
  message: null,
  timeoutId: null,
}))

export function showToast(message: string, durationMs = 3200) {
  const { timeoutId } = useToast.getState()
  if (timeoutId) clearTimeout(timeoutId)

  const nextTimeoutId = setTimeout(() => {
    useToast.setState({ message: null, timeoutId: null }, true)
  }, durationMs)

  useToast.setState({ message, timeoutId: nextTimeoutId }, true)
}

export function dismissToast() {
  const { timeoutId } = useToast.getState()
  if (timeoutId) clearTimeout(timeoutId)
  useToast.setState({ message: null, timeoutId: null }, true)
}
