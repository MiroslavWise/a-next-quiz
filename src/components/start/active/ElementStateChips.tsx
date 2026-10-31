"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { Flame, Mountain, Shield } from "lucide-react"

import { getReportMySkills, type ElementPhase } from "@/api/reports"
import { EUserElement } from "@/enum/element"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"

const AVATAR_PHASE_HINT: Record<ElementPhase, string> = {
  FIRE: "Жар: speed-очки ×1.15",
  WATER: "Течение: +5% к очкам ответа",
  EARTH: "Корни: серия до 45%",
  AIR: "Порыв: 40% шанс +7% base",
}

function StateChip({ icon, label, hint, accent }: { icon: ReactNode; label: string; hint: string; accent: string }) {
  return (
    <li
      title={hint}
      aria-label={`${label}. ${hint}`}
      className="inline-flex items-center gap-1 rounded-md border-2 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-white shadow-[2px_2px_0_0_#0a0c0b]"
      style={{
        borderColor: accent,
        backgroundColor: `color-mix(in srgb, ${accent} 22%, #121418)`,
      }}
    >
      {icon}
      {label}
    </li>
  )
}

function ElementStateChips({ reportId, activeIndex }: { reportId?: string; activeIndex?: number }) {
  const { data } = useQuery({
    queryKey: ["my-skills", reportId, activeIndex] as const,
    queryFn: () => getReportMySkills(reportId!),
    enabled: !!reportId,
  })

  const state = data?.element_state
  if (!state || (!state.fire_burning && !state.earth_monolith && !state.avatar_phase && !state.comeback_active)) {
    return null
  }

  const fire = GAME_ELEMENT_VISUAL_BY_ID[EUserElement.FIRE]
  const earth = GAME_ELEMENT_VISUAL_BY_ID[EUserElement.EARTH]
  const phase = state.avatar_phase ? GAME_ELEMENT_VISUAL_BY_ID[state.avatar_phase as EUserElement] : null

  return (
    <ul className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Состояние стихии на вопросе">
      {state.comeback_active ? (
        <StateChip
          icon={<Shield className="size-3" style={{ color: "#6EE7B7" }} aria-hidden />}
          label="Комбек"
          hint="Шансовые штрафы стихий отключены, пока отрыв от лидера велик"
          accent="#6EE7B7"
        />
      ) : null}
      {state.fire_burning ? (
        <StateChip
          icon={<Flame className="size-3" style={{ color: fire.accentColor }} aria-hidden />}
          label="Горение"
          hint="Speed-очки тают быстрее, верный ответ +15% base"
          accent={fire.accentColor}
        />
      ) : null}
      {state.earth_monolith ? (
        <StateChip
          icon={<Mountain className="size-3" style={{ color: earth.accentColor }} aria-hidden />}
          label="Монолит"
          hint="Обвал на этом вопросе не сработает"
          accent={earth.accentColor}
        />
      ) : null}
      {state.avatar_phase && phase ? (
        <StateChip
          icon={<Image src={phase.iconSrc} alt="" width={12} height={12} className="size-3 object-contain" />}
          label={`Фаза: ${phase.name}`}
          hint={AVATAR_PHASE_HINT[state.avatar_phase]}
          accent={phase.accentColor}
        />
      ) : null}
    </ul>
  )
}

ElementStateChips.displayName = "ElementStateChips"
export default ElementStateChips
