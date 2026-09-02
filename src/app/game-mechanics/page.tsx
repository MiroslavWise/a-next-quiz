import GameMechanicsContent from "@/components/game-mechanics/GameMechanicsContent"
import { gameMechanicsJsonLd, gameMechanicsMetadata } from "@/lib/seo-game-mechanics"

export const metadata = gameMechanicsMetadata

export default function GameMechanicsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gameMechanicsJsonLd) }} />
      <main className="text-foreground flex h-full w-full flex-col items-center px-0 lg:px-4">
        <section className="container mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-4 py-8">
          <GameMechanicsContent />
        </section>
      </main>
    </>
  )
}
