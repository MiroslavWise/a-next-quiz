"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"

import type { SkillId } from "@/api/reports"
import { EUserElement } from "@/enum/element"
import {
  ELEMENTAL_SKILLS,
  GAME_SKILLS,
  ULTIMATE_SKILLS,
  isElementalSkillId,
  isUltimateSkillId,
  type GameSkillDefinition,
} from "@/enum/game-skill"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"
import { GameSkillIcon } from "@/lib/game-skill-icons"
import { cn } from "@/lib/utils"

import { useContextInfoSkill } from "./ContextInfoSkill"
import { useCloseSkillInfoOnUnmount } from "./SkillIconButton"
import waveSt from "../styles/timer-waves.module.scss"

interface StaffGameSkillsProps {
  bySkillId: Map<SkillId, number[]>
  className?: string
  style?: CSSProperties
}

const ELEMENT_BY_SUFFIX: Record<string, EUserElement> = {
  FIRE: EUserElement.FIRE,
  WATER: EUserElement.WATER,
  EARTH: EUserElement.EARTH,
  AIR: EUserElement.AIR,
}

/** Цвет для ELEM_* и ULT_* одной стихии (слот + ульт). */
function skillElementAccent(skillId: SkillId): string | null {
  if (!isElementalSkillId(skillId) && !isUltimateSkillId(skillId)) return null
  const suffix = skillId.replace(/^(ELEM_|ULT_)/, "")
  const element = ELEMENT_BY_SUFFIX[suffix]
  return element ? GAME_ELEMENT_VISUAL_BY_ID[element].accentColor : null
}

function StaffSkillSeal({
  definition,
  count,
  selected,
  zIndex,
  overlap,
  onSelect,
}: {
  definition: GameSkillDefinition
  count: number
  selected: boolean
  zIndex: number
  overlap: boolean
  onSelect: (skillId: SkillId) => void
}) {
  const prevCountRef = useRef(count)
  const [waveKey, setWaveKey] = useState(0)
  const elementAccent = skillElementAccent(definition.id)

  useEffect(() => {
    if (count > prevCountRef.current) {
      setWaveKey((key) => key + 1)
    }
    prevCountRef.current = count
  }, [count])

  return (
    <button
      type="button"
      aria-expanded={selected}
      aria-label={`${definition.title}. Активировали: ${count}`}
      title={`${definition.title}: ${count}`}
      onClick={() => onSelect(definition.id)}
      className={cn(
        "relative flex size-(--seal-size) shrink-0 items-center justify-center rounded-full border-2 shadow-[0_0_0_2px_#06141a] transition-shadow",
        !elementAccent && "border-(--accent-orb)/70 bg-[#12161c] text-amber-50",
        overlap && "-mr-2.5",
        selected && "ring-2 ring-white/50",
      )}
      style={
        elementAccent
          ? {
              zIndex,
              borderColor: elementAccent,
              color: elementAccent,
              backgroundColor: `color-mix(in srgb, ${elementAccent} 22%, #06141a)`,
            }
          : { zIndex }
      }
    >
      {waveKey > 0 ? (
        <span
          key={waveKey}
          className={waveSt.waveBurst}
          style={
            {
              "--wave-max-scale": 2.2,
              ...(elementAccent ? { "--wave-color": elementAccent } : null),
            } as CSSProperties
          }
          aria-hidden
        />
      ) : null}
      <GameSkillIcon skillId={definition.id} className="relative z-10 size-3 shrink-0 opacity-90" />
      <span
        className={cn(
          "absolute -top-1 -right-1 z-20 flex min-w-3.5 items-center justify-center rounded-full border bg-background px-0.5 text-[9px] leading-3 font-semibold tabular-nums",
          !elementAccent && "border-(--accent-orb)/55 text-(--accent-orb)",
        )}
        style={elementAccent ? { borderColor: `${elementAccent}99`, color: elementAccent } : undefined}
      >
        {count}
      </span>
    </button>
  )
}

function StaffGameSkills({ bySkillId, className, style }: StaffGameSkillsProps) {
  const { open, value } = useContextInfoSkill()

  useCloseSkillInfoOnUnmount()

  const activeSkills = useMemo(
    () =>
      [...GAME_SKILLS, ...ELEMENTAL_SKILLS, ...ULTIMATE_SKILLS]
        .map((definition) => ({
          definition,
          count: (bySkillId.get(definition.id) ?? []).length,
        }))
        .filter((item) => item.count > 0),
    [bySkillId],
  )

  if (activeSkills.length === 0) return null

  return (
    <div className={cn("relative w-fit", className)} style={style} aria-label="Активированные способности">
      <div className="flex flex-row-reverse items-center">
        {activeSkills.map((item, index) => (
          <StaffSkillSeal
            key={item.definition.id}
            definition={item.definition}
            count={item.count}
            selected={value === item.definition.id}
            zIndex={index + 1}
            overlap={index > 0}
            onSelect={open}
          />
        ))}
      </div>
    </div>
  )
}

StaffGameSkills.displayName = "StaffGameSkills"
export default StaffGameSkills
