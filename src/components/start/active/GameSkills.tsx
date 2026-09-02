"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Lock, RotateCw } from "lucide-react"
import { useEffect, useState } from "react"

import { getRank } from "@/api/rank"
import {
  activateReportSkill,
  getReportMySkills,
  type IReportMySkillsResponse,
  type SkillId,
  type SkillStatus,
} from "@/api/reports"
import { ApiRequestError } from "@/api/errors"
import Button from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { GAME_SKILLS, getGameSkillDefinition } from "@/enum/game-skill"
import { GameSkillIcon } from "@/lib/game-skill-icons"
import { cn } from "@/lib/utils"
import { showToast } from "@/stores/toast"

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

function activationErrorMessage(error: unknown): string {
  if (!ApiRequestError.is(error)) return "Не удалось активировать способность"

  switch (error.code) {
    case "skill_already_used":
      return "Эта способность уже использована"
    case "skill_active_on_question":
      return "На этом вопросе уже активна другая способность"
    case "skill_not_available":
      return "Сейчас эта способность недоступна"
    default:
      return error.message
  }
}

function GameSkills({ reportId, tgId, activeIndex, questionId }: GameSkillsProps) {
  const queryClient = useQueryClient()
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId | null>(null)
  const queryKey = ["my-skills", reportId, activeIndex] as const

  // Страховка: vaul/Radix оставляют `body { pointer-events: none }`, если Drawer
  // размонтируется в открытом состоянии (вопрос завершился, пока открыто окно способности).
  // Из-за этого вся страница перестаёт кликаться — восстанавливаем при размонтировании.
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = ""
      }
    }
  }, [])

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

  const activation = useMutation({
    mutationFn: (skillId: SkillId) =>
      activateReportSkill(reportId, {
        skillId,
        index: activeIndex,
        questionId,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData<IReportMySkillsResponse>(queryKey, (current) => ({
        telegram_id: current?.telegram_id ?? "",
        active_index: response.active_index,
        active_skill: response.skill_id,
        skills: response.skills,
      }))
      showToast(`${getGameSkillDefinition(response.skill_id).title} активировано`)
      setSelectedSkillId(null)
    },
    onError: (error) => {
      showToast(activationErrorMessage(error))
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  const selectedDefinition = selectedSkillId ? getGameSkillDefinition(selectedSkillId) : null
  const selectedState = skillsQuery.data?.skills.find((skill) => skill.id === selectedSkillId)
  const selectedStatus = selectedState?.status ?? "available"
  const playerIsTopThree = typeof rankQuery.data?.rank === "number" && rankQuery.data.rank >= 1 && rankQuery.data.rank <= 3
  const selectedIsPvp = !!selectedDefinition?.pvp
  const selectedPvpBlocked = selectedIsPvp && playerIsTopThree
  const selectedPvpRankPending = selectedIsPvp && rankQuery.isPending
  const activationPending = activation.isPending

  return (
    <>
      <section className="flex min-h-10 items-center justify-center" aria-label="Одноразовые способности">
        {skillsQuery.isPending ? (
          <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Загрузка способностей">
            {GAME_SKILLS.map((skill) => (
              <span key={skill.id} className="size-9 animate-pulse rounded-full border border-white/10 bg-white/5" aria-hidden />
            ))}
          </div>
        ) : skillsQuery.isError ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void skillsQuery.refetch()}
            disabled={skillsQuery.isFetching}
          >
            <RotateCw className={cn("size-3.5", skillsQuery.isFetching && "animate-spin")} aria-hidden />
            Повторить загрузку способностей
          </Button>
        ) : (
          <div className="glass-start-liquid-palette flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/12 p-1.5 shadow-lg shadow-black/15">
            {GAME_SKILLS.map((definition) => {
              const state = skillsQuery.data?.skills.find((skill) => skill.id === definition.id)
              const status = state?.status ?? "available"
              const isActive = status === "active"
              const isUsed = status === "used"
              const isPvpBlocked = !!definition.pvp && playerIsTopThree
              const statusText = isPvpBlocked ? "Недоступна: вы в топ-3" : skillStatusLabel[status]

              return (
                <Button
                  key={definition.id}
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label={`${definition.title}. ${statusText}`}
                  aria-pressed={isActive}
                  title={`${definition.title}: ${statusText}`}
                  onClick={() => setSelectedSkillId(definition.id)}
                  disabled={activationPending}
                  className={cn(
                    "relative rounded-full border-white/15 bg-black/25 text-white/80",
                    "hover:border-(--accent-orb)/55 hover:bg-(--accent-orb)/15 hover:text-white",
                    isActive && "border-(--accent-orb)/70 bg-(--accent-orb)/25 text-white ring-2 ring-(--accent-orb)/35",
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

      <Drawer open={selectedSkillId !== null} onOpenChange={(open) => !open && setSelectedSkillId(null)}>
        <DrawerContent>
          {selectedDefinition ? (
            <>
              <DrawerHeader className="text-left">
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-(--accent-orb)/40 bg-(--accent-orb)/15 text-(--accent-orb)">
                    <GameSkillIcon skillId={selectedDefinition.id} className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <DrawerTitle>{selectedDefinition.title}</DrawerTitle>
                    <p className="text-xs font-medium text-(--accent-orb)">{selectedDefinition.short}</p>
                  </div>
                </div>
                <DrawerDescription className="text-left leading-relaxed">{selectedDefinition.detail}</DrawerDescription>
                {selectedDefinition.condition ? (
                  <p className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs leading-relaxed text-white/70">
                    {selectedDefinition.condition}
                  </p>
                ) : null}
                {selectedPvpBlocked ? (
                  <p className="mt-2 rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-left text-xs leading-relaxed text-amber-100">
                    {selectedDefinition.title} недоступен: сейчас вы занимаете место в топ-3.
                  </p>
                ) : null}
              </DrawerHeader>
              <DrawerFooter>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => selectedSkillId && activation.mutate(selectedSkillId)}
                  disabled={
                    selectedStatus !== "available" || activationPending || selectedPvpBlocked || selectedPvpRankPending
                  }
                >
                  {activationPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                  {selectedStatus === "active"
                    ? "Активна на этом вопросе"
                    : selectedStatus === "used"
                      ? "Уже использована"
                      : selectedPvpBlocked
                        ? "Недоступно в топ-3"
                        : selectedPvpRankPending
                          ? "Проверяем место…"
                      : "Активировать"}
                </Button>
              </DrawerFooter>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  )
}

GameSkills.displayName = "GameSkills"
export default GameSkills
