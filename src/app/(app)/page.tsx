import { Suspense } from "react"

import MainTitle from "@/components/common/main-title"
import MyGamesList from "@/components/common/MyGamesList"

import HomeAdminFooter from "@/views/home/HomeAdminFooter"
import HomeIdentity from "@/views/home/HomeIdentity"
import HomeJoinByCode from "@/views/home/HomeJoinByCode"
import HomeLayout from "@/views/home/HomeLayout"
import HomeMechanicsLink from "@/views/home/HomeMechanicsLink"

/**
 * Главная: Server Component (оболочка) + клиентские острова
 * (профиль, список игр, OTP/start_param, admin footer).
 */
export default function HomePage() {
  return (
    <>
      <main className="text-foreground flex h-full w-full flex-col items-center px-0 lg:px-4">
        <section className="container mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-4 py-8">
          <HomeLayout>
            <MainTitle />
            <div className="flex flex-col gap-3.5">
              <HomeIdentity />
              <HomeMechanicsLink />
              <Suspense fallback={null}>
                <MyGamesList />
              </Suspense>
              <HomeJoinByCode />
            </div>
          </HomeLayout>
        </section>
      </main>
      <HomeAdminFooter />
    </>
  )
}
