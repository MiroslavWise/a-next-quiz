import AppPageHeaders from "@/components/common/AppPageHeaders"
import CharacterRoster from "@/components/characters/CharacterRoster"

export default function CharactersPage() {
  return (
    <main className="text-foreground flex h-full min-h-0 w-full flex-col items-center overflow-y-auto px-0">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 pt-4 pb-8 sm:px-4 sm:pt-6 sm:pb-10">
        <AppPageHeaders
          title="Персонажи"
          description="Четыре стихии копят опыт отдельно. Уровень открывает их силу."
          toolbarTitle="Мои персонажи"
          accent="four"
          backTo="/"
          backAriaLabel="На главную"
          toolbarClassName="mb-1"
        />
        <CharacterRoster />
      </section>
    </main>
  )
}
