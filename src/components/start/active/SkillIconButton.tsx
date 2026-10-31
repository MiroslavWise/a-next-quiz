"use client"

import { useEffect, type ReactNode } from "react"

import Button from "@/components/ui/button"
import { GameSkillIcon } from "@/lib/game-skill-icons"

import { cn } from "@/lib/utils"
import type { SkillId } from "@/api/reports"
import { useContextInfoSkill } from "./ContextInfoSkill"

const skillIconButtonClass = cn(
  "relative z-10 size-9 overflow-visible rounded-full border-2 border-black/80 bg-[#121418] text-white/85",
  "hover:border-(--accent-orb) hover:text-white",
  "shadow-[3px_3px_0_0_#0a0c0b]",
)

const skillIconButtonLitClass =
  "border-(--accent-orb) bg-[#1a1610] text-white game-hard-ring"

const skillIconButtonReadyClass =
  "border-(--accent-orb) game-hard-ring-ready"

export function useCloseSkillInfoOnUnmount() {
  const { close } = useContextInfoSkill()
  useEffect(() => () => close(), [])
}

export function SkillPalette({ children }: { children: ReactNode }) {
  return (
    <div className="glass-start-liquid-palette relative flex flex-wrap items-center justify-center gap-1.5 overflow-visible rounded-full p-1.5">
      {children}
    </div>
  )
}

export function SkillIconButton({
  skillId,
  label,
  title,
  pressed,
  disabled,
  lit,
  ready,
  manaFill = 0,
  className,
  onSelect,
  children,
}: {
  skillId: SkillId
  label: string
  title: string
  pressed?: boolean
  disabled?: boolean
  lit?: boolean
  /** Хватает маны и скилл доступен — спокойное кольцо готовности. */
  ready?: boolean
  /** 0..1 заливка «бутылочки» до стоимости скила. */
  manaFill?: number
  className?: string
  onSelect: (skillId: SkillId) => void
  children?: ReactNode
}) {
  const fill = Math.max(0, Math.min(1, manaFill))

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      aria-label={label}
      aria-pressed={pressed}
      title={title}
      disabled={disabled}
      onClick={() => onSelect(skillId)}
      className={cn(skillIconButtonClass, lit && skillIconButtonLitClass, !lit && ready && skillIconButtonReadyClass, className)}
    >
      {/* Клип только заливки маны — бейджи (замок и др.) должны выходить за круг */}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden>
        <span
          className="absolute inset-0 origin-bottom transition-transform duration-300 ease-out"
          style={{
            transform: `scaleY(${fill})`,
            background: "color-mix(in srgb, var(--accent-orb) 72%, #0a0c0b 28%)",
          }}
        />
      </span>
      <GameSkillIcon skillId={skillId} className="relative z-10 size-4.5" />
      {children}
    </Button>
  )
}
