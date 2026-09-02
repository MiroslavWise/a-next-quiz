"use client"

import { type PropsWithChildren } from "react"

import MainContext from "@/providers/main-context"

export default function AppTemplate({ children }: PropsWithChildren) {
  return <MainContext>{children}</MainContext>
}
