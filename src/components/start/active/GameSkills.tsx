"use client"

import { useIsMutating, useQuery } from "@tanstack/react-query"
import { Lock, RotateCw } from "lucide-react"
import { useEffect } from "react"

import { getRank } from "@/api/rank"
import { getReportMySkills, type SkillStatus } from "@/api/reports"
import Button from "@/components/ui/button"
import { GAME_SKILLS } from "@/enum/game-skill"
import { cn } from "@/lib/utils"
import { GameSkillIcon } from "@/lib/game-skill-icons"

import { useContextInfoSkill } from "./ContextInfoSkill"

interface GameSkillsProps {
  reportId: string
  tgId: number
  activeIndex: number
  questionId: string
}

const skillStatusLabel: Record<SkillStatus, string> = {
  available: "Доступна",
  active: "Активна",
  used: "Использована",
}

function GameSkills({ reportId, tgId, activeIndex, questionId }: GameSkillsProps) {
  const { open, close, value: selectedSkillId } = useContextInfoSkill()
  const queryKey = ["my-skills", reportId, activeIndex] as const
  const activationPending = useIsMutating({ mutationKey: ["activate-report-skill", reportId, questionId] }) > 0

  useEffect(() => () => close(), [close])

  const skillsQuery = useQuery({
    queryKey,
    queryFn: () => getReportMySkills(reportId),
    enabled: !!reportId && !!questionId,
    refetchOnMount: true,
  })
  const rankQuery = useQuery({
    queryKey: ["rank", reportId, tgId, activeIndex],
    queryFn: () => getRank(reportId),
    enabled: !!reportId && !!tgId && !!questionId,
    refetchOnMount: true,
  })

  const playerIsTopThree = typeof rankQuery.data?.rank === "number" && rankQuery.data.rank >= 1 && rankQuery.data.rank <= 3

  return (
    <section className="flex min-h-10 items-center justify-center" aria-label="Одноразовые способности">
      {skillsQuery.isPending ? (
        <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Загрузка способностей">
          {GAME_SKILLS.map((skill) => (
            <span key={skill.id} className="size-9 animate-pulse rounded-full border border-white/10 bg-white/5" aria-hidden />
          ))}
        </div>
      ) : skillsQuery.isError ? (
        <Button type="button" variant="outline" size="sm" onClick={() => void skillsQuery.refetch()} disabled={skillsQuery.isFetching}>
          <RotateCw className={cn("size-3.5", skillsQuery.isFetching && "animate-spin")} aria-hidden />
          Повторить загрузку способностей
        </Button>
      ) : (
        <div className="glass-start-liquid-palette flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/12 p-1.5 shadow-none">
          {GAME_SKILLS.map((definition) => {
            const state = skillsQuery.data?.skills.find((skill) => skill.id === definition.id)
            const status = state?.status ?? "available"
            const isActive = status === "active"
            const isUsed = status === "used"
            const isPvpBlocked = !!definition.pvp && playerIsTopThree
            const isSelected = selectedSkillId === definition.id
            const statusText = isPvpBlocked ? "Недоступна: вы в топ-3" : skillStatusLabel[status]

            return (
              <Button
                key={definition.id}
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label={`${definition.title}. ${statusText}`}
                aria-pressed={isActive || isSelected}
                title={`${definition.title}: ${statusText}`}
                onClick={() => open(definition.id)}
                disabled={activationPending}
                className={cn(
                  "relative rounded-full border-white/15 bg-black/25 text-white/80",
                  "hover:border-(--accent-orb)/55 hover:bg-(--accent-orb)/15 hover:text-white",
                  (isActive || isSelected) &&
                    "border-(--accent-orb) bg-(--accent-orb)/25 text-white shadow-[0_0_22px_color-mix(in_srgb,var(--accent-orb)_55%,transparent)] ring-2 ring-(--accent-orb)/45",
                  isUsed && "border-white/8 bg-white/4 text-white/35 grayscale",
                  isPvpBlocked && "border-white/8 bg-white/4 text-white/30 grayscale",
                )}
              >
                <GameSkillIcon skillId={definition.id} className="size-4.5" />
                {isPvpBlocked ? (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border border-white/15 bg-background text-white/60">
                    <Lock className="size-2.5" aria-hidden />
                  </span>
                ) : null}
                {isActive ? (
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-(--accent-orb)" />
                ) : null}
              </Button>
            )
          })}
        </div>
      )}
    </section>
  )
}

GameSkills.displayName = "GameSkills"
export default GameSkills
