"use client"

import { useIsMutating, useQuery } from "@tanstack/react-query"
import { Lock, RotateCw } from "lucide-react"

import { getRank } from "@/api/rank"
import { getReportMySkills, type SkillStatus } from "@/api/reports"
import Button from "@/components/ui/button"
import { GAME_SKILLS } from "@/enum/game-skill"
import { cn } from "@/lib/utils"

import { useContextInfoSkill } from "./ContextInfoSkill"
import { SkillIconButton, SkillPalette, useCloseSkillInfoOnUnmount } from "./SkillIconButton"

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
  const { open, value: selectedSkillId } = useContextInfoSkill()
  const queryKey = ["my-skills", reportId, activeIndex] as const
  const activationPending = useIsMutating({ mutationKey: ["activate-report-skill", reportId, questionId] }) > 0

  useCloseSkillInfoOnUnmount()

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
        <SkillPalette>
          {GAME_SKILLS.map((definition) => {
            const state = skillsQuery.data?.skills.find((skill) => skill.id === definition.id)
            const status = state?.status ?? "available"
            const isActive = status === "active"
            const isUsed = status === "used"
            const isPvpBlocked = !!definition.pvp && playerIsTopThree
            const isSelected = selectedSkillId === definition.id
            const statusText = isPvpBlocked ? "Недоступна: вы в топ-3" : skillStatusLabel[status]
            const lit = isActive || isSelected

            return (
              <SkillIconButton
                key={definition.id}
                skillId={definition.id}
                label={`${definition.title}. ${statusText}`}
                title={`${definition.title}: ${statusText}`}
                pressed={lit}
                disabled={activationPending}
                lit={lit}
                onSelect={open}
                className={cn(
                  isUsed && "border-white/8 bg-white/4 text-white/35 grayscale",
                  isPvpBlocked && "border-white/8 bg-white/4 text-white/30 grayscale",
                )}
              >
                {isPvpBlocked ? (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border border-white/15 bg-background text-white/60">
                    <Lock className="size-2.5" aria-hidden />
                  </span>
                ) : null}
                {isActive ? (
                  <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-(--accent-orb)" />
                ) : null}
              </SkillIconButton>
            )
          })}
        </SkillPalette>
      )}
    </section>
  )
}

GameSkills.displayName = "GameSkills"
export default GameSkills
