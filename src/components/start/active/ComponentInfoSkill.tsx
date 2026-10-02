"use client"

import { useEffect } from "react"
import { Loader2, X } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/common/UserAvatar"

import { getRank } from "@/api/rank"
import { showToast } from "@/stores/toast"
import { ApiRequestError } from "@/api/errors"
import { useUserByTgId } from "@/queries/user"
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

function SkillActivatorRow({ telegramId, viewerTgId }: { telegramId: number; viewerTgId: number }) {
  const { data, isLoading } = useUserByTgId(telegramId, {
    enabled: !!telegramId && !!viewerTgId,
  })

  if (isLoading) {
    return (
      <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2.5 rounded-lg bg-white/6 px-2.5 py-2">
        <Skeleton className="size-9 shrink-0 rounded-full bg-white/10" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-3 w-28 rounded bg-white/12" />
          <Skeleton className="h-2.5 w-36 rounded bg-white/8" />
        </div>
      </li>
    )
  }

  const pseudo = data?.pseudo?.trim() || `Пользователь ${telegramId}`
  const fullName =
    [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim() || (data?.username?.trim() ? `@${data.username.trim()}` : "—")

  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2.5 rounded-lg bg-white/6 px-2.5 py-2 text-left">
      <UserAvatar
        variant="footer"
        bare
        avatar={data?.avatar}
        bg={data?.bg}
        pseudo={pseudo}
        photoUrl={data?.photo_url}
        element={data?.element}
        className="size-9 shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm leading-tight font-medium text-white">{pseudo}</p>
        <p className="truncate text-xs leading-tight text-white/55">{fullName}</p>
      </div>
    </li>
  )
}

function ComponentInfoSkill() {
  const { value, enabled, close, reportId, tgId, activeIndex, questionId, audience, activators } = useContextInfoSkill()
  const isStaff = audience === "staff"
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
    enabled: enabled && !isStaff && !!reportId && !!questionId,
  })
  const rankQuery = useQuery({
    queryKey: ["rank", reportId, tgId, activeIndex],
    queryFn: () => getRank(reportId),
    enabled: enabled && !isStaff && !!reportId && !!tgId && !!questionId,
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
  const selectedPvpBlocked = !isStaff && selectedIsPvp && playerIsTopThree
  const selectedPvpRankPending = !isStaff && selectedIsPvp && rankQuery.isPending
  const activationPending = activation.isPending

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/35"
        aria-label="Закрыть карточку способности"
        onClick={close}
      />
      <article role="dialog" aria-modal="true" aria-labelledby="skill-info-title" className="skill-info-card glass3d">
        <div className="skill-info-card-art" data-skill={definition.id} aria-hidden />
        <div className="flex max-h-[inherit] flex-col gap-3 overflow-y-auto overscroll-contain p-4">
          <header className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-(--accent-orb)/40 bg-(--accent-orb)/15 text-(--accent-orb)">
              <GameSkillIcon skillId={definition.id} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="skill-info-title" className="text-base leading-tight font-semibold text-white">
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
          {isStaff ? (
            <div className="space-y-2 text-left">
              <p className="text-sm font-medium text-white">На этом вопросе</p>
              {activators.length > 0 ? (
                <ul className="flex flex-col gap-1.5" aria-label={`Активировали ${definition.title}`}>
                  {activators.map((telegramId) => (
                    <SkillActivatorRow key={telegramId} telegramId={telegramId} viewerTgId={tgId} />
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-white/70">
                  Пока никто не активировал
                </p>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </article>
    </>
  )
}

export default ComponentInfoSkill
