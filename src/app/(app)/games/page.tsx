import AppPageHeaders from "@/components/common/AppPageHeaders"
import MyGamesList from "@/components/common/MyGamesList"

export default function GamesPage() {
  return (
    <main className="text-foreground flex h-full min-h-0 w-full flex-col items-center overflow-y-auto px-0">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-0 px-3 pt-4 pb-8 sm:px-4 sm:pt-6 sm:pb-10">
        <AppPageHeaders
          title="Игры"
          description="Последние завершённые матчи и ваши результаты"
          toolbarTitle="Мои игры"
          accent="two"
          backTo="/"
          backAriaLabel="На главную"
          toolbarClassName="mb-4"
        />
        <MyGamesList />
      </section>
    </main>
  )
}
