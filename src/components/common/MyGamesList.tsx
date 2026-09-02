"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ChevronRight, Gamepad2, Trophy } from "lucide-react"

import Skeleton from "@/components/ui/skeleton"
import { getMyGames, type IMyGame } from "@/api/reports"
import { formatDistanceToNowRu } from "@/lib/date"
import { cn } from "@/lib/utils"

function GameCardSkeleton() {
  return (
    <div className="relative flex h-48 w-32 shrink-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/5">
      {/* Matches image area: 96px tall */}
      <div className="h-24 w-full shrink-0 overflow-hidden rounded-none">
        <Skeleton className="h-full w-full rounded-none bg-white/8" />
      </div>
      {/* Matches content area: px-2.5 py-2, two text lines + date line at bottom */}
      <div className="flex flex-1 flex-col px-2.5 py-2">
        <Skeleton className="h-3 w-full rounded bg-white/8" />
        <Skeleton className="mt-1 h-3 w-4/5 rounded bg-white/6" />
        <Skeleton className="mt-auto h-2.5 w-2/3 rounded bg-white/5" />
      </div>
    </div>
  )
}

function GameCard({ game }: { game: IMyGame }) {
  const router = useRouter()
  const quizName = game.quiz?.name ?? "Квиз удалён"
  const imageUrl = game.quiz?.imageUrl ?? null
  const date = formatDistanceToNowRu(game.created_at)

  return (
    <button
      type="button"
      onClick={() => router.push(`/my-game-result/${game.id}`)}
      className={cn(
        "group relative flex h-36 w-32 shrink-0 flex-col overflow-hidden rounded-2xl",
        "border border-white/10 bg-white/5 text-left",
        "transition-all duration-200 active:scale-[0.96] active:brightness-90",
        "hover:border-white/20 hover:bg-white/8",
      )}
    >
      {/* Image area */}
      <div className="relative h-24 w-full overflow-hidden bg-white/5 shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={quizName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Gamepad2 className="size-8 text-white/20" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5 px-2.5 py-2">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-white/90">{quizName}</p>
        <p className="mt-auto text-[10px] leading-tight text-white/35">{date}</p>
      </div>

      {/* Arrow hint */}
      <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <ChevronRight className="size-3 text-white/60" />
      </div>
    </button>
  )
}

export default function MyGamesList() {
  const { data: games, isLoading, isError } = useQuery({
    queryKey: ["my-games"],
    queryFn: getMyGames,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

  if (isLoading) {
    return (
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="size-3.5 text-white/40" />
          <span className="text-xs font-medium tracking-wide text-white/40 uppercase">Мои игры</span>
        </div>
        <div
          className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      </section>
    )
  }

  if (isError || !games || games.length === 0) return null

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Trophy className="size-3.5 text-white/40" />
        <span className="text-xs font-medium tracking-wide text-white/40 uppercase">Мои игры</span>
        <span className="ml-auto text-[11px] text-white/25">{games.length}</span>
      </div>
      {/* Horizontal scroll, bleeds to screen edges */}
      <div
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
        {/* Trailing spacer so last card doesn't clip */}
        <div className="w-1 shrink-0" aria-hidden />
      </div>
    </section>
  )
}
