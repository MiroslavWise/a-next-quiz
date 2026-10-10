"use client"

import Image from "next/image"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Lock } from "lucide-react"

import { getMyCharacter, patchCharacterName } from "@/api/characters"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Skeleton from "@/components/ui/skeleton"
import { showToast } from "@/stores/toast"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"

const ELEMENTS = ["FIRE", "WATER", "EARTH", "AIR"] as const

function formatPoints(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value)
}

export default function CharacterDetailView({ element }: { element: string }) {
  const normalized = element.toUpperCase()
  const known = (ELEMENTS as readonly string[]).includes(normalized)
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ["characters", "me", normalized],
    queryFn: () => getMyCharacter(normalized),
    enabled: known,
  })
  const [name, setName] = useState<string | null>(null)
  const shownName = name ?? query.data?.name ?? ""

  const rename = useMutation({
    mutationFn: (next: string) => patchCharacterName(normalized, next),
    onSuccess: async (detail) => {
      setName(null)
      queryClient.setQueryData(["characters", "me", normalized], detail)
      await queryClient.invalidateQueries({ queryKey: ["characters", "me"] })
      await queryClient.invalidateQueries({ queryKey: ["user"] })
      showToast("Имя персонажа сохранено")
    },
    onError: () => showToast("Не удалось сохранить имя"),
  })

  if (!known) {
    return <p className="text-sm text-white/70">Такой стихии нет.</p>
  }

  if (query.isLoading) {
    return <Skeleton className="h-64 rounded-2xl bg-white/8" />
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-white/70">Не удалось загрузить персонажа.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void query.refetch()}>
          Повторить
        </Button>
      </div>
    )
  }

  const card = query.data
  const visual = GAME_ELEMENT_VISUAL_BY_ID[card.element]
  const dirty = shownName.trim() !== card.name && shownName.trim().length > 0

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border bg-white/4 px-4 py-4" style={{ borderColor: `${visual.accentColor}66` }}>
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl border bg-black/20" style={{ borderColor: visual.accentColor }}>
            <Image src={visual.iconSrc} alt="" width={28} height={28} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">{card.name}</p>
            <p className="text-xs text-white/55">
              {visual.name} · уровень {card.current_level} · {formatPoints(card.total_points)} опыта · {card.games_played} игр
            </p>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={card.progress_percent} aria-valuemin={0} aria-valuemax={100} aria-label="Прогресс уровня">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, card.progress_percent)}%`, background: visual.accentColor }} />
        </div>
        <p className="mt-2 text-xs text-white/60">
          {card.current_level >= 50 ? "Достигнут 50 уровень" : `До уровня ${card.current_level + 1} осталось ${formatPoints(card.points_to_next_level)}`}
        </p>
      </section>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          if (!dirty || rename.isPending) return
          rename.mutate(shownName.trim())
        }}
      >
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-white/60">
          Имя персонажа
          <Input value={shownName} maxLength={24} onChange={(event) => setName(event.target.value)} aria-describedby="character-name-hint" />
        </label>
        <Button type="submit" className="sm:self-end" disabled={!dirty || rename.isPending}>
          Сохранить
        </Button>
      </form>
      <p id="character-name-hint" className="text-xs text-white/45">
        От 1 до 24 символов. Очки при смене имени не меняются.
      </p>

      <ol className="flex flex-col gap-2" aria-label="Способности">
        {card.ladder.map((step) => (
          <li key={step.id} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
            <span className="mt-0.5 text-white/70" aria-hidden>
              {step.unlocked ? <Check className="size-4 text-emerald-300" /> : <Lock className="size-4 text-white/35" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-white">
                Уровень {step.level} · {step.title}
              </span>
              <span className="block text-xs text-white/55">{step.detail}</span>
              <span className="sr-only">{step.unlocked ? "Открыто" : "Закрыто"}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
