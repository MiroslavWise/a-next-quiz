"use client"

import Image from "next/image"
import { useIsMutating, useQuery } from "@tanstack/react-query"
import { Lock, RotateCw } from "lucide-react"

import { getRank } from "@/api/rank"
import { getReportMySkills } from "@/api/reports"
import Button from "@/components/ui/button"
import { GAME_SKILLS, gameSkillLockLabel } from "@/enum/game-skill"
import { GAME_SKILL_RESONANCES, getResonanceAccent, getResonanceIconSrc } from "@/lib/game-elements-catalog"
import { cn } from "@/lib/utils"

import { useContextInfoSkill } from "./ContextInfoSkill"
import { ManaVial } from "./ManaVial"
import { SkillIconButton, SkillPalette, useCloseSkillInfoOnUnmount } from "./SkillIconButton"

interface GameSkillsProps {
  reportId: string
  tgId: number
  activeIndex: number
  questionId: string
}

function manaFillRatio(mana: number | undefined, cost: number | undefined) {
  if (!cost || cost <= 0) return 0
  return Math.max(0, Math.min(1, (mana ?? 0) / cost))
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
  const mana = skillsQuery.data?.mana ?? 0
  const manaMax = skillsQuery.data?.mana_max ?? 0

  return (
    <section className="flex min-h-10 items-center justify-center gap-2" aria-label="Одноразовые способности">
      {skillsQuery.isPending ? (
        <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Загрузка способностей">
          <span className="h-10 w-7 animate-pulse rounded-md border border-white/10 bg-white/5" aria-hidden />
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
        <>
          <ManaVial mana={mana} manaMax={manaMax} />
          <SkillPalette>
            {GAME_SKILLS.map((definition) => {
              const state = skillsQuery.data?.skills.find((skill) => skill.id === definition.id)
              const status = state?.status ?? "available"
              const isActive = status === "active"
              const isUsed = status === "used"
              const isPvpBlocked = !!definition.pvp && playerIsTopThree
              const isSelected = selectedSkillId === definition.id
              const cost = state?.mana_cost ?? 0
              const fill = manaFillRatio(mana, cost)
              const canAfford = cost <= 0 || mana >= cost
              const ready = status === "available" && !isPvpBlocked && canAfford
              const statusText = isPvpBlocked
                ? "Недоступна: вы в топ-3"
                : !canAfford && status === "available"
                  ? `Мана ${mana}/${cost}`
                  : gameSkillLockLabel(status, { isElemental: state?.is_elemental, isUltimate: state?.is_ultimate })
              const lit = isActive || isSelected
              const resonance = state?.resonance ? GAME_SKILL_RESONANCES[definition.id] : undefined
              const resonanceText = resonance ? `. Резонанс: ${resonance.title}` : ""
              const manaText = cost > 0 ? `. Стоимость ${cost}` : ""

              return (
                <SkillIconButton
                  key={definition.id}
                  skillId={definition.id}
                  label={`${definition.title}. ${statusText}${resonanceText}${manaText}`}
                  title={`${definition.title}: ${statusText}${resonanceText}${manaText}`}
                  pressed={lit}
                  disabled={activationPending}
                  lit={lit}
                  ready={ready}
                  manaFill={isUsed || isPvpBlocked ? 0 : fill}
                  onSelect={open}
                  className={cn(
                    isUsed && "border-white/8 bg-white/4 text-white/35 grayscale",
                    isPvpBlocked && "z-20 border-white/8 bg-white/4 text-white/30 grayscale",
                    !isUsed && !isPvpBlocked && !canAfford && status === "available" && "border-white/10 text-white/55",
                  )}
                >
                  {isPvpBlocked ? (
                    <span className="absolute -top-1 -right-1 z-20 flex size-4 items-center justify-center rounded-full border border-white/15 bg-background text-white/60">
                      <Lock className="size-2.5" aria-hidden />
                    </span>
                  ) : null}
                  {isActive ? (
                    <span className="absolute -top-0.5 -right-0.5 z-20 size-2.5 rounded-full border-2 border-background bg-(--accent-orb)" />
                  ) : null}
                  {resonance && !isUsed ? (
                    <span
                      className="bg-background absolute -bottom-1 -left-1 z-20 flex size-4 items-center justify-center rounded-full border"
                      style={{ borderColor: getResonanceAccent(resonance.element) }}
                      aria-hidden
                    >
                      <Image src={getResonanceIconSrc(resonance.element)} alt="" width={10} height={10} className="size-2.5 object-contain" />
                    </span>
                  ) : null}
                </SkillIconButton>
              )
            })}
            {skillsQuery.data?.skills
              .filter((skill) => skill.is_elemental || skill.is_ultimate)
              .map((skill) => {
                const status = skill.status
                const isActive = status === "active"
                const isUsed = status === "used"
                const isLocked = status === "locked"
                const isSelected = selectedSkillId === skill.id
                const cost = skill.mana_cost ?? 0
                const fill = manaFillRatio(mana, cost)
                const canAfford = cost <= 0 || mana >= cost
                const ready = status === "available" && canAfford
                const statusText =
                  !canAfford && status === "available"
                    ? `Мана ${mana}/${cost}`
                    : gameSkillLockLabel(status, { isElemental: skill.is_elemental, isUltimate: skill.is_ultimate })
                const lit = isActive || isSelected
                return (
                  <SkillIconButton
                    key={skill.id}
                    skillId={skill.id}
                    label={`${skill.title}. ${statusText}. Стоимость ${cost}`}
                    title={`${skill.title}: ${statusText}. Стоимость ${cost}`}
                    pressed={lit}
                    disabled={activationPending}
                    lit={lit}
                    ready={ready}
                    manaFill={isUsed || isLocked ? 0 : fill}
                    onSelect={open}
                    className={cn(
                      "border-amber-200/80 text-amber-50",
                      (isUsed || isLocked) && "border-white/10 bg-white/4 text-white/40 grayscale",
                      isLocked && "z-20",
                      !isUsed && !isLocked && !canAfford && status === "available" && "border-white/10 text-white/55",
                    )}
                  >
                    {isLocked ? (
                      <span className="absolute -top-1 -right-1 z-20 flex size-4 items-center justify-center rounded-full border border-amber-200/40 bg-background text-amber-100">
                        <Lock className="size-2.5" aria-hidden />
                      </span>
                    ) : null}
                    {isActive ? <span className="absolute -top-0.5 -right-0.5 z-20 size-2.5 rounded-full border-2 border-background bg-amber-200" /> : null}
                  </SkillIconButton>
                )
              })}
          </SkillPalette>
        </>
      )}
    </section>
  )
}

GameSkills.displayName = "GameSkills"
export default GameSkills
