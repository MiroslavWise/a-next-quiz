"use client"

import { useAuthJwtClaims } from "@/lib/jwt"
import { cn } from "@/lib/utils"

/** Отступ только для админов (место под fixed footer). */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = useAuthJwtClaims()?.is_admin ?? false
  return <div className={cn("flex h-full w-full flex-col justify-center gap-3", isAdmin && "-mt-10 lg:mt-0")}>{children}</div>
}
