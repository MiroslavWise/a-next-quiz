"use client"

import { useEffect, type ReactNode } from "react"

import Button from "@/components/ui/button"
import { GameSkillIcon } from "@/lib/game-skill-icons"

import { cn } from "@/lib/utils"
import type { SkillId } from "@/api/reports"
import { useContextInfoSkill } from "./ContextInfoSkill"

const skillIconButtonClass = cn(
  "relative z-10 size-9 rounded-full border-white/15 bg-black/25 text-white/80",
  "hover:border-(--accent-orb)/55 hover:bg-(--accent-orb)/15 hover:text-white",
)

const skillIconButtonLitClass =
  "border-(--accent-orb) bg-(--accent-orb)/25 text-white shadow-[0_0_22px_color-mix(in_srgb,var(--accent-orb)_55%,transparent)] ring-2 ring-(--accent-orb)/45"

export function useCloseSkillInfoOnUnmount() {
  const { close } = useContextInfoSkill()
  useEffect(() => () => close(), [])
}

export function SkillPalette({ children }: { children: ReactNode }) {
  return (
    <div className="glass-start-liquid-palette relative flex flex-wrap items-center justify-center gap-1.5 overflow-visible rounded-full border border-white/12 p-1.5 shadow-none">
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
  className?: string
  onSelect: (skillId: SkillId) => void
  children?: ReactNode
}) {
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
      className={cn(skillIconButtonClass, lit && skillIconButtonLitClass, className)}
    >
      <GameSkillIcon skillId={skillId} className="size-4.5" />
      {children}
    </Button>
  )
}
