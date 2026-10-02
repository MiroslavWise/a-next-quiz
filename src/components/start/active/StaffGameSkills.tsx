"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import type { SkillId } from "@/api/reports"
import { GAME_SKILLS, type GameSkillDefinition } from "@/enum/game-skill"
import { cn } from "@/lib/utils"

import { useContextInfoSkill } from "./ContextInfoSkill"
import { SkillIconButton, SkillPalette, useCloseSkillInfoOnUnmount } from "./SkillIconButton"
import waveSt from "../styles/timer-waves.module.scss"

interface StaffGameSkillsProps {
  bySkillId: Map<SkillId, number[]>
  /** После END — больше воздуха от графиков/ответов; в GAME компактнее. */
  isQuestionEnded?: boolean
}

function StaffSkillButton({
  definition,
  count,
  selected,
  onSelect,
}: {
  definition: GameSkillDefinition
  count: number
  selected: boolean
  onSelect: (skillId: SkillId) => void
}) {
  const prevCountRef = useRef(count)
  const [waveKey, setWaveKey] = useState(0)
  const hasActivations = count > 0

  useEffect(() => {
    if (count > prevCountRef.current) {
      setWaveKey((key) => key + 1)
    }
    prevCountRef.current = count
  }, [count])

  return (
    <div className="relative isolate inline-flex size-9 shrink-0 items-center justify-center overflow-visible">
      {waveKey > 0 ? (
        <span key={waveKey} className={waveSt.waveBurst} style={{ "--wave-max-scale": 2.6 } as CSSProperties} aria-hidden />
      ) : null}
      <SkillIconButton
        skillId={definition.id}
        label={hasActivations ? `${definition.title}. Активировали: ${count}` : `${definition.title}. Пока никто не активировал`}
        title={hasActivations ? `${definition.title}: ${count}` : `${definition.title}: никто не активировал`}
        pressed={hasActivations || selected}
        lit={hasActivations || selected}
        onSelect={onSelect}
      >
        {hasActivations ? (
          <span className="absolute -top-1 -right-1 z-20 flex min-w-4 items-center justify-center rounded-full border border-(--accent-orb)/50 bg-background px-1 text-[10px] leading-4 font-semibold text-(--accent-orb) tabular-nums">
            {count}
          </span>
        ) : null}
      </SkillIconButton>
    </div>
  )
}

function StaffGameSkills({ bySkillId, isQuestionEnded = false }: StaffGameSkillsProps) {
  const { open, value } = useContextInfoSkill()

  useCloseSkillInfoOnUnmount()

  return (
    <section
      className={cn(
        "relative z-10 flex min-h-10 items-center justify-center overflow-visible",
        isQuestionEnded ? "my-3 py-4" : "py-3",
      )}
      aria-label="Способности участников"
    >
      <SkillPalette>
        {GAME_SKILLS.map((definition) => (
          <StaffSkillButton
            key={definition.id}
            definition={definition}
            count={(bySkillId.get(definition.id) ?? []).length}
            selected={value === definition.id}
            onSelect={open}
          />
        ))}
      </SkillPalette>
    </section>
  )
}

StaffGameSkills.displayName = "StaffGameSkills"
export default StaffGameSkills
