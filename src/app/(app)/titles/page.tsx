import AppPageHeaders from "@/components/common/AppPageHeaders"
import MyTitlesList from "@/components/titles/MyTitlesList"

export default function TitlesPage() {
  return (
    <main className="text-foreground flex h-full min-h-0 w-full flex-col items-center overflow-y-auto px-0">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-0 px-3 pt-4 pb-8 sm:px-4 sm:pt-6 sm:pb-10">
        <AppPageHeaders
          title="Звания"
          description="Сколько раз факты вечера уже были вашими"
          toolbarTitle="Мои звания"
          accent="four"
          backTo="/"
          backAriaLabel="На главную"
          toolbarClassName="mb-4"
        />
        <MyTitlesList />
      </section>
    </main>
  )
}
