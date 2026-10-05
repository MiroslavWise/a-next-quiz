import HomeAdminFooter from "@/views/home/HomeAdminFooter"
import HomeGamesLink from "@/views/home/HomeGamesLink"
import HomeIdentity from "@/views/home/HomeIdentity"
import HomeJoinByCode from "@/views/home/HomeJoinByCode"
import HomeLayout from "@/views/home/HomeLayout"
import HomeMechanicsLink from "@/views/home/HomeMechanicsLink"
import HomeTitlesLink from "@/views/home/HomeTitlesLink"

/**
 * Главная: Server Component (оболочка) + клиентские острова
 * (профиль, ссылки на звания и игры, OTP/start_param, admin footer).
 */
export default function HomePage() {
  return (
    <>
      <main className="text-foreground flex h-full w-full flex-col items-center px-0 lg:px-4">
        <section className="container mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-4 py-8">
          <HomeLayout>
            <div className="flex flex-col gap-3.5">
              <HomeIdentity />
              <HomeMechanicsLink />
              <HomeTitlesLink />
              <HomeGamesLink />
              <HomeJoinByCode />
            </div>
          </HomeLayout>
        </section>
      </main>
      <HomeAdminFooter />
    </>
  )
}
