"use client"

import { useEffect } from "react"
import { Loader2, X } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import Button from "@/components/ui/button"

import { getRank } from "@/api/rank"
import { showToast } from "@/stores/toast"
import { ApiRequestError } from "@/api/errors"
import { GameSkillIcon } from "@/lib/game-skill-icons"
import { getGameSkillDefinition } from "@/enum/game-skill"
import { activateReportSkill, getReportMySkills, type IReportMySkillsResponse, type SkillId } from "@/api/reports"

import { useContextInfoSkill } from "./ContextInfoSkill"

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

function ComponentInfoSkill() {
  const { value, enabled, close, reportId, tgId, activeIndex, questionId } = useContextInfoSkill()
  const queryClient = useQueryClient()
  const queryKey = ["my-skills", reportId, activeIndex] as const

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled, close])

  const skillsQuery = useQuery({
    queryKey,
    queryFn: () => getReportMySkills(reportId),
    enabled: enabled && !!reportId && !!questionId,
  })
  const rankQuery = useQuery({
    queryKey: ["rank", reportId, tgId, activeIndex],
    queryFn: () => getRank(reportId),
    enabled: enabled && !!reportId && !!tgId && !!questionId,
  })

  const activation = useMutation({
    mutationKey: ["activate-report-skill", reportId, questionId],
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
      close()
    },
    onError: (error) => {
      showToast(activationErrorMessage(error))
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  if (!enabled || !value) return null

  const definition = getGameSkillDefinition(value)
  const selectedState = skillsQuery.data?.skills.find((skill) => skill.id === value)
  const selectedStatus = selectedState?.status ?? "available"
  const playerIsTopThree = typeof rankQuery.data?.rank === "number" && rankQuery.data.rank >= 1 && rankQuery.data.rank <= 3
  const selectedIsPvp = !!definition.pvp
  const selectedPvpBlocked = selectedIsPvp && playerIsTopThree
  const selectedPvpRankPending = selectedIsPvp && rankQuery.isPending
  const activationPending = activation.isPending

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/35"
        aria-label="Закрыть карточку способности"
        onClick={close}
      />
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-info-title"
        className="skill-info-card"
      >
        <div className="skill-info-card-art" data-skill={definition.id} aria-hidden />
        <div className="relative z-10 flex max-h-[inherit] flex-col gap-3 overflow-y-auto overscroll-contain p-4">
          <header className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-(--accent-orb)/40 bg-(--accent-orb)/15 text-(--accent-orb)">
              <GameSkillIcon skillId={definition.id} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="skill-info-title" className="text-base font-semibold leading-tight text-white">
                {definition.title}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-(--accent-orb)">{definition.short}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Закрыть"
              onClick={close}
              className="shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" aria-hidden />
            </Button>
          </header>
          <p className="text-sm leading-relaxed text-white/80">{definition.detail}</p>
          {definition.condition ? (
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-white/70">
              {definition.condition}
            </p>
          ) : null}
          {selectedPvpBlocked ? (
            <p className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100">
              {definition.title} недоступен: сейчас вы занимаете место в топ-3.
            </p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => activation.mutate(value)}
            disabled={selectedStatus !== "available" || activationPending || selectedPvpBlocked || selectedPvpRankPending || !questionId}
            className="glass-start-btn-primary-palette mt-1 h-11 w-full rounded-2xl text-white hover:bg-transparent"
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
        </div>
      </article>
    </>
  )
}

export default ComponentInfoSkill
