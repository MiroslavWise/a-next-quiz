"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ChevronRight, Gamepad2 } from "lucide-react"

import { getMyGames, type IMyGame } from "@/api/reports"
import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import { formatDistanceToNowRu } from "@/lib/date"
import { cn } from "@/lib/utils"

function GameRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-3">
      <Skeleton className="size-14 shrink-0 rounded-lg bg-white/10" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-40 bg-white/10" />
        <Skeleton className="mt-2 h-3 w-24 bg-white/6" />
      </div>
    </div>
  )
}

function GameRow({ game }: { game: IMyGame }) {
  const quizName = game.quiz?.name ?? "Квиз удалён"
  const imageUrl = game.quiz?.imageUrl ?? null
  const date = formatDistanceToNowRu(game.created_at)

  return (
    <Link
      href={`/my-game-result/${game.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 px-3 py-3 text-left",
        "transition-colors hover:border-white/20 hover:bg-white/8",
        "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--accent-orb)/50",
      )}
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <span className="flex size-full items-center justify-center">
            <Gamepad2 className="size-6 text-white/25" aria-hidden />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-sm font-medium leading-snug text-white/90">{quizName}</span>
        {date ? <span className="mt-0.5 block text-xs text-white/40">{date}</span> : null}
      </span>
      <ChevronRight className="size-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  )
}

export default function MyGamesList() {
  const { data: games, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-games"],
    queryFn: getMyGames,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-2" aria-busy="true" aria-label="Загрузка игр">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}>
            <GameRowSkeleton />
          </li>
        ))}
      </ul>
    )
  }

  if (isError || !games) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/4 px-4 py-4" role="alert">
        <p className="text-sm text-white/80">Не удалось загрузить игры</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" disabled={isFetching} onClick={() => refetch()}>
          Повторить
        </Button>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/4 px-4 py-4">
        <p className="text-sm text-white/70">Завершённых игр пока нет</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="Мои игры">
      {games.map((game) => (
        <li key={game.id}>
          <GameRow game={game} />
        </li>
      ))}
    </ul>
  )
}
