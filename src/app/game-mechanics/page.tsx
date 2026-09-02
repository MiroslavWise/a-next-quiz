import GameMechanicsContent from "@/components/game-mechanics/GameMechanicsContent"
import { gameMechanicsJsonLd, gameMechanicsMetadata } from "@/lib/seo-game-mechanics"

export const metadata = gameMechanicsMetadata

export default function GameMechanicsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameMechanicsJsonLd) }} />
      <main className="text-foreground flex h-full min-h-0 w-full flex-col items-center overflow-y-auto px-0">
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-0 px-3 pt-4 pb-8 sm:px-4 sm:pt-6 sm:pb-10">
          <GameMechanicsContent />
        </section>
      </main>
    </>
  )
}
