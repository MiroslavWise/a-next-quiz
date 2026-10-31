"use client"

import { useEffect, useId, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface ManaVialProps {
  mana: number
  manaMax: number
  className?: string
}

/** Компактная колба запаса маны (заливка снизу вверх). По нажатию — краткая справка. */
export function ManaVial({ mana, manaMax, className }: ManaVialProps) {
  const safeMax = Math.max(0, manaMax)
  const safeMana = Math.max(0, Math.min(mana, safeMax || mana))
  const fill = safeMax > 0 ? Math.min(1, safeMana / safeMax) : 0
  const prevRef = useRef(safeMana)
  const [pulse, setPulse] = useState(false)
  const [open, setOpen] = useState(false)
  const tipId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (safeMana > prevRef.current) {
      setPulse(true)
      const t = window.setTimeout(() => setPulse(false), 420)
      prevRef.current = safeMana
      return () => window.clearTimeout(t)
    }
    prevRef.current = safeMana
  }, [safeMana])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn("relative flex flex-col items-center gap-0.5", className)}>
      <button
        type="button"
        className="flex flex-col items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-(--accent-orb)/55"
        aria-label={`Мана ${safeMana} из ${safeMax}. Подробнее`}
        aria-expanded={open}
        aria-controls={tipId}
        onClick={() => setOpen((value) => !value)}
      >
        <div
          className={cn(
            "relative h-10 w-7 overflow-hidden rounded-md border-2 border-black/80 bg-[#0c1012] shadow-[2px_2px_0_0_#0a0c0b]",
            pulse && "outline outline-2 outline-(--accent-orb)",
          )}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={safeMax}
          aria-valuenow={safeMana}
          aria-hidden
        >
          <div
            className="absolute inset-x-0 bottom-0 transition-[height] duration-300 ease-out"
            style={{
              height: `${Math.round(fill * 100)}%`,
              background: "color-mix(in srgb, var(--accent-orb) 78%, #0a0c0b 22%)",
            }}
          />
        </div>
        <span className="text-[0.65rem] leading-none font-medium tabular-nums text-white/75">{safeMana}</span>
      </button>

      {open ? (
        <div
          id={tipId}
          role="tooltip"
          className="game-liquid absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-52 rounded-lg px-3 py-2.5 text-left"
        >
          <p className="text-xs font-semibold text-white">Мана · {safeMana} / {safeMax}</p>
          <p className="mt-1 text-[0.7rem] leading-snug text-white/70">
            Ресурс на каст способностей. Копится за очки (35% от прироста), расходуется при активации скила.
          </p>
          <p className="mt-1 text-[0.65rem] leading-snug text-white/50">
            Каждый каст поднимает цену следующих на +8%. Заливка на иконке — прогресс до стоимости скила.
          </p>
        </div>
      ) : null}
    </div>
  )
}
