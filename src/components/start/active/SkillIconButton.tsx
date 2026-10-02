"use client"

import { useEffect, useId, useState, type ReactNode } from "react"

import type { SkillId } from "@/api/reports"
import Button from "@/components/ui/button"
import { GAME_SKILLS } from "@/enum/game-skill"
import { GameSkillIcon } from "@/lib/game-skill-icons"
import { cn } from "@/lib/utils"

import { useContextInfoSkill } from "./ContextInfoSkill"

export type SkillMark = "lit" | "muted"

const skillIconButtonClass = cn(
  "relative z-10 size-9 rounded-full border-white/15 bg-black/25 text-white/80",
  "hover:border-(--accent-orb)/55 hover:bg-(--accent-orb)/15 hover:text-white",
)

const skillIconButtonLitClass =
  "border-(--accent-orb) bg-(--accent-orb)/25 text-white shadow-[0_0_22px_color-mix(in_srgb,var(--accent-orb)_55%,transparent)] ring-2 ring-(--accent-orb)/45"

export function useCloseSkillInfoOnUnmount() {
  const { close } = useContextInfoSkill()
  useEffect(() => () => close(), [close])
}

export function SkillPalette({ children }: { children: ReactNode }) {
  return (
    <div className="glass-start-liquid-palette relative flex flex-wrap items-center justify-start gap-1.5 overflow-visible rounded-full border border-white/12 p-1.5 shadow-none">
      {children}
    </div>
  )
}

export function SkillDock({
  label,
  marks,
  disabled,
  children,
}: {
  label: string
  marks?: Partial<Record<SkillId, SkillMark>>
  disabled?: boolean
  children: ReactNode
}) {
  const panelId = useId()
  const { close, activeIndex, questionId } = useContextInfoSkill()
  const [expanded, setExpanded] = useState(false)
  const lit = GAME_SKILLS.some((skill) => marks?.[skill.id] === "lit")

  useEffect(() => {
    setExpanded(false)
  }, [activeIndex, questionId])

  function toggle() {
    if (disabled) return
    setExpanded((current) => {
      if (current) close()
      return !current
    })
  }

  return (
    <div className="skill-dock">
      <div className={cn("skill-hex-wrap", lit && "is-lit")}>
        <button
          type="button"
          className={cn("skill-hex glass3d", disabled && "animate-pulse")}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={expanded ? "Свернуть способности" : label}
          disabled={disabled}
          onClick={toggle}
        >
          <span className="skill-hex-icons">
            {GAME_SKILLS.map((skill) => (
              <GameSkillIcon
                key={skill.id}
                skillId={skill.id}
                className={cn(
                  "size-3",
                  marks?.[skill.id] === "muted" && "opacity-35 grayscale",
                  marks?.[skill.id] === "lit" && "text-white drop-shadow-[0_0_6px_var(--accent-orb)]",
                )}
              />
            ))}
          </span>
        </button>
      </div>
      <div id={panelId} className="skill-dock-panel" data-open={expanded} hidden={!expanded && undefined}>
        <div className="skill-dock-panel-inner">{children}</div>
      </div>
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
