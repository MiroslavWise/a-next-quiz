"use client"

import { useEffect, useRef, useState } from "react"

import type { IMatchTitle } from "@/api/reports"
import { MatchTitleMark } from "@/components/report/MatchTitleChip"
import { matchTitleById, type MatchTitleCatalogItem } from "@/content/match-titles"
import { cn } from "@/lib/utils"

function knownTitles(titles?: IMatchTitle[] | null): MatchTitleCatalogItem[] {
  return (titles ?? []).flatMap((item) => {
    const known = matchTitleById(item?.id)
    return known ? [known] : []
  })
}

/** Кружки достижений на правом верхнем углу рамки карточки игрока. */
export function MatchTitleSeals({ titles, className }: { titles?: IMatchTitle[] | null; className?: string }) {
  const list = knownTitles(titles)
  const [activeId, setActiveId] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (list.length === 0) return

    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setActiveId(null)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveId(null)
    }

    document.addEventListener("click", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("click", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [list.length])

  if (list.length === 0) return null

  const active = list.find((item) => item.id === activeId) ?? null

  return (
    <div
      ref={rootRef}
      className={cn("absolute z-20 w-fit", className)}
      style={{ right: "-0.45rem", top: "-0.45rem" }}
    >
      <div className="flex flex-row-reverse items-center" aria-label="Достижения">
        {list.map((item, index) => {
          const rare = Boolean(item.rare)
          const isActive = activeId === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-expanded={isActive}
              aria-label={item.title}
              onClick={() => setActiveId((current) => (current === item.id ? null : item.id))}
              className={cn(
                "relative flex size-[1.35rem] shrink-0 items-center justify-center rounded-full border-2 shadow-[0_3px_6px_rgba(0,0,0,0.45)] transition-shadow",
                "hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
                index > 0 && "-mr-2",
                rare
                  ? "border-amber-200/85 bg-[#1a1408] text-amber-50"
                  : "border-amber-500/75 bg-[#12161c] text-amber-100",
                isActive && "ring-2 ring-white/50",
              )}
              style={{ zIndex: index + 1 }}
            >
              <MatchTitleMark id={item.id} className="size-3" />
            </button>
          )
        })}
      </div>
      {active ? (
        <span
          className={cn(
            "absolute top-full right-0 z-30 mt-2 flex w-max max-w-48 flex-col gap-0.5 rounded-lg border px-2 py-1.5 text-left leading-snug backdrop-blur-md",
            "text-[0.62rem]",
            active.rare
              ? "border-amber-200/45 bg-amber-950/95 text-amber-50"
              : "border-amber-500/45 bg-[#12161c]/95 text-amber-50",
          )}
        >
          <span className="inline-flex items-center gap-1 font-semibold">
            <MatchTitleMark id={active.id} className="size-3" />
            {active.title}
          </span>
          <span className="text-pretty font-medium text-white/80">{active.detail}</span>
        </span>
      ) : null}
    </div>
  )
}
