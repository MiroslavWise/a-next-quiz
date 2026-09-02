"use client"

import { PropsWithChildren } from "react"

import AdminContext from "@/providers/admin-context"

export default function AdminTemplate({ children }: PropsWithChildren) {
  return <AdminContext>{children}</AdminContext>
}
