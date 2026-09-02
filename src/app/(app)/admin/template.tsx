"use client"

import AdminContext from "@/providers/admin-context"

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <AdminContext>{children}</AdminContext>
}
