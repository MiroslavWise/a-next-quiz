"use client"

import MainContext from "@/providers/main-context"

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <MainContext>{children}</MainContext>
}
