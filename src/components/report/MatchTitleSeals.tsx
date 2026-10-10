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
      className={cn("pointer-events-none absolute top-0 right-2.5 z-20 w-fit -translate-y-1/2", className)}
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
                "pointer-events-auto relative flex size-7 shrink-0 items-center justify-center rounded-full bg-background/95 p-0.5",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_16px_rgba(0,0,0,0.4)]",
                "transition-transform hover:!z-50 hover:scale-105 focus-visible:!z-50 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
                index > 0 && "-mr-2.5",
                isActive && "!z-50 ring-2 ring-white/55",
              )}
              style={{ zIndex: list.length - index }}
            >
              <span
                className={cn(
                  "flex size-full items-center justify-center rounded-full border shadow-lg shadow-black/30",
                  rare
                    ? "border-amber-200/85 bg-[#1a1408] text-amber-50"
                    : "border-amber-400/75 bg-[#12161c] text-amber-100",
                )}
              >
                <MatchTitleMark id={item.id} className="size-3.5" />
              </span>
            </button>
          )
        })}
      </div>
      {active ? (
        <span
          className={cn(
            "pointer-events-auto absolute top-full right-0 z-30 mt-2 flex w-max max-w-48 flex-col gap-0.5 rounded-lg border px-2 py-1.5 text-left leading-snug backdrop-blur-md",
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
