"use client"

import { elementThemeById, type ElementThemeId } from "@/constants/palette"

const ORB_BG_VARS = ["--orb-bg-one", "--orb-bg-two", "--orb-bg-three", "--orb-bg-four"] as const
const ORB_BORDER_VARS = ["--orb-border-one", "--orb-border-two", "--orb-border-three", "--orb-border-four"] as const

export function applyElementTheme(themeId: ElementThemeId): void {
  if (typeof document === "undefined") return

  const { orbs, accent } = elementThemeById(themeId)
  const root = document.documentElement

  ORB_BG_VARS.forEach((name, index) => {
    root.style.setProperty(name, orbs[index])
  })
  ORB_BORDER_VARS.forEach((name, index) => {
    root.style.setProperty(name, orbs[index])
  })
  root.style.setProperty("--accent-orb", accent)
}
