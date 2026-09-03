"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import Spinner from "@/components/ui/spinner"
import PrizeLottie from "@/components/lottie/PrizeLottie"

import { cn } from "@/lib/utils"
import { patchReportPrizes } from "@/api/reports"

function sortPrizes(places: number[]) {
  return places.toSorted((a, b) => a - b)
}

function normalizePrizes(places: number[], maxPlace: number) {
  const unique = [...new Set(places.filter((place) => place >= 1 && place <= maxPlace))]
  return sortPrizes(unique)
}

function placeLabel(place: number) {
  return `${place} место`
}

export interface PrizesPickerProps {
  reportId: number
  prizes: number[]
  usersCount: number
  /** Только ведущий (владелец отчёта); PATCH доступен ему как админу. */
  isLeader: boolean
}

export default function PrizesPicker({ reportId, prizes, usersCount, isLeader }: PrizesPickerProps) {
  if (!isLeader) return null

  return <PrizesPickerContent reportId={reportId} prizes={prizes} usersCount={usersCount} />
}

function PrizesPickerContent({ reportId, prizes, usersCount }: Omit<PrizesPickerProps, "isLeader">) {
  const queryClient = useQueryClient()
  const skipServerSyncRef = useRef(false)
  const [selected, setSelected] = useState<number[]>(() => normalizePrizes(prizes, usersCount))

  const { mutate, isPending } = useMutation({
    mutationFn: (nextPrizes: number[]) => patchReportPrizes(reportId, nextPrizes),
    onMutate: () => {
      skipServerSyncRef.current = true
    },
    onSuccess: (res) => {
      setSelected(normalizePrizes(res.prizes, usersCount))
      void queryClient.invalidateQueries({ queryKey: ["report", String(reportId)] })
    },
    onError: () => {
      setSelected(normalizePrizes(prizes, usersCount))
      console.error("Не удалось сохранить призовые места")
    },
    onSettled: () => {
      skipServerSyncRef.current = false
    },
  })

  useEffect(() => {
    if (skipServerSyncRef.current) return
    setSelected(normalizePrizes(prizes, usersCount))
  }, [prizes, usersCount])

  const prevUsersCountRef = useRef(usersCount)

  useEffect(() => {
    if (prevUsersCountRef.current === usersCount) return
    prevUsersCountRef.current = usersCount

    setSelected((current) => {
      const trimmed = usersCount <= 0 ? [] : normalizePrizes(current, usersCount)
      const unchanged =
        usersCount <= 0
          ? current.length === 0
          : trimmed.length === current.length && trimmed.every((place, index) => place === current[index])

      if (unchanged) return current

      mutate(trimmed)
      return trimmed
    })
  }, [usersCount, mutate])

  function togglePlace(place: number) {
    if (usersCount <= 0 || isPending) return

    const isSelected = selected.includes(place)
    let next: number[]

    if (isSelected) {
      next = selected.filter((item) => item !== place)
    } else if (selected.length >= usersCount) {
      return
    } else {
      next = sortPrizes([...selected, place])
    }

    setSelected(next)
    mutate(next)
  }

  const availablePlaces = usersCount > 0 ? Array.from({ length: usersCount }, (_, index) => index + 1) : []

  return (
    <section
      className="glass-start-liquid-palette w-full max-w-[calc(100vw-2rem)] shrink-0 space-y-2.5 overflow-hidden rounded-2xl p-3 sm:p-4"
      aria-label="Призовые места"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <PrizeLottie className="size-3.5 shrink-0" />
            <h2 className="text-sm font-semibold text-white">Призовые места</h2>
          </div>
          <p className="text-[0.7rem] leading-relaxed text-white/55 sm:text-xs">
            {usersCount > 0
              ? `Выберите до ${usersCount} ${usersCount === 1 ? "места" : "мест"} — не больше числа игроков`
              : "Когда подключатся игроки, здесь можно отметить призовые места"}
          </p>
        </div>
        {isPending ? <Spinner className="size-4 shrink-0 text-white/70" /> : null}
      </div>

      {usersCount > 0 ? (
        <>
          <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [-webkit-overflow-scrolling:touch] scrollbar-thin">
            {availablePlaces.map((place) => {
              const isActive = selected.includes(place)
              return (
                <button
                  key={place}
                  type="button"
                  disabled={isPending}
                  aria-pressed={isActive}
                  aria-label={placeLabel(place)}
                  onClick={() => togglePlace(place)}
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums transition-colors",
                    "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white/40",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    isActive ? "glass-start-slab-selected" : "glass-start-slab hover:border-(--accent-orb)/50",
                  )}
                >
                  {place}
                </button>
              )
            })}
          </div>
          <p className="text-[0.68rem] text-white/45">
            Выбрано: {selected.length} из {usersCount}
            {selected.length > 0 ? ` · ${selected.join(", ")}` : ""}
          </p>
        </>
      ) : null}
    </section>
  )
}
