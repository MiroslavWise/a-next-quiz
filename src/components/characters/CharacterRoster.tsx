"use client"

import Image from "next/image"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { getMyCharacters, type ICharacterCard } from "@/api/characters"
import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"

function formatPoints(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value)
}

function CharacterCardView({ card }: { card: ICharacterCard }) {
  const visual = GAME_ELEMENT_VISUAL_BY_ID[card.element]
  const atCap = card.current_level >= 50

  return (
    <Link
      href={`/characters/${card.element}`}
      className="flex flex-col gap-3 rounded-2xl border bg-white/4 px-4 py-4 text-left transition-colors hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-(--accent-orb) focus-visible:outline-none"
      style={{ borderColor: `${visual.accentColor}55` }}
    >
      <span className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl border bg-black/20" style={{ borderColor: visual.accentColor }}>
          <Image src={visual.iconSrc} alt="" width={22} height={22} className="size-6 object-contain" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{card.name}</span>
          <span className="block text-xs text-white/55">{visual.name}</span>
        </span>
        <span className="ml-auto text-2xl font-black tabular-nums" style={{ color: visual.accentColor }}>
          {card.current_level}
        </span>
      </span>
      <span className="block">
        <span className="mb-1 flex justify-between text-[11px] text-white/55">
          <span>{formatPoints(card.total_points)} опыта</span>
          <span>{atCap ? "Максимум" : `до ${card.current_level + 1}: ${formatPoints(card.points_to_next_level)}`}</span>
        </span>
        <span className="block h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <span className="block h-full rounded-full" style={{ width: `${Math.min(100, card.progress_percent)}%`, background: visual.accentColor }} />
        </span>
        <span className="sr-only">
          Уровень {card.current_level}, прогресс {card.progress_percent} процентов
        </span>
      </span>
    </Link>
  )
}

export default function CharacterRoster() {
  const query = useQuery({
    queryKey: ["characters", "me"],
    queryFn: getMyCharacters,
  })

  if (query.isLoading) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Загрузка персонажей">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index}>
            <Skeleton className="h-28 rounded-2xl bg-white/8" />
          </li>
        ))}
      </ul>
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 px-4 py-4">
        <p className="text-sm text-white/70">Не удалось загрузить персонажей.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
          Повторить
        </Button>
      </div>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {query.data.characters.map((card) => (
        <li key={card.element}>
          <CharacterCardView card={card} />
        </li>
      ))}
    </ul>
  )
}
