import AppPageHeaders from "@/components/common/AppPageHeaders"
import CharacterDetailView from "@/components/characters/CharacterDetailView"

export default async function CharacterElementPage({ params }: PageProps<"/characters/[element]">) {
  const { element } = await params
  return (
    <main className="text-foreground flex h-full min-h-0 w-full flex-col items-center overflow-y-auto px-0">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 pt-4 pb-8 sm:px-4 sm:pt-6 sm:pb-10">
        <AppPageHeaders
          title="Персонаж"
          description="Уровень, имя и лестница способностей."
          toolbarTitle="Персонаж"
          accent="four"
          backTo="/characters"
          backAriaLabel="Ко всем персонажам"
          toolbarClassName="mb-1"
        />
        <CharacterDetailView element={element} />
      </section>
    </main>
  )
}
