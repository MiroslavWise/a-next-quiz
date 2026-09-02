"use client"

import { create } from "zustand"

type ElementThemeSessionState = {
  isGameAvatar: boolean
}

export const useElementThemeSession = create<ElementThemeSessionState>(() => ({
  isGameAvatar: false,
}))

export function setElementThemeSessionIsGameAvatar(isGameAvatar: boolean) {
  useElementThemeSession.setState({ isGameAvatar }, true)
}
