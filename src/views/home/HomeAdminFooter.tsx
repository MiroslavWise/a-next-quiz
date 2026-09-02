"use client"

import { Suspense, lazy } from "react"

import { useAuthJwtClaims } from "@/lib/jwt"

const FooterMenu = lazy(() => import("@/components/common/footer-menu"))

export default function HomeAdminFooter() {
  const isAdmin = useAuthJwtClaims()?.is_admin ?? false
  if (!isAdmin) return null
  return (
    <Suspense fallback={null}>
      <FooterMenu />
    </Suspense>
  )
}
