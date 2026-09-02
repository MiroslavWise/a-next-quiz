"use client"

import { type PropsWithChildren } from "react"

import { useAuth } from "@/stores/auth"
import { AuthStatus } from "@/enum/auth"
import { useAuthJwtClaims } from "@/lib/jwt"

const AdminContext = ({ children }: PropsWithChildren) => {
  const claims = useAuthJwtClaims()
  const status = useAuth(({ status }) => status)

  if (status === AuthStatus.AUTHENTICATED && claims?.is_admin) return children

  return (
    <section className="bg-background flex min-h-dvh w-full items-center justify-center px-4">
      <div className="border-border bg-card flex w-full max-w-sm flex-col gap-4 rounded-2xl border p-6 text-left">
        <h2 className="text-foreground text-base font-semibold tracking-tight">Нет доступа</h2>
        <p className="text-muted-foreground text-xs">У вас нет прав администратора для просмотра этой страницы.</p>
      </div>
    </section>
  )
}

export default AdminContext
