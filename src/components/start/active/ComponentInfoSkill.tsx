"use client"

import { useEffect } from "react"
import Image from "next/image"
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
import { gameSkillLockLabel, getGameSkillDefinition, isElementalSkillId, isUltimateSkillId } from "@/enum/game-skill"
import { GAME_SKILL_RESONANCES, getResonanceAccent, getResonanceIconSrc } from "@/lib/game-elements-catalog"
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
    case "ultimate_locked":
      return "Персонаж не достиг 10 уровня"
    case "insufficient_mana":
      return "Недостаточно маны для этой способности"
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
        mana: response.mana ?? current?.mana,
        mana_max: response.mana_max ?? current?.mana_max,
        skill_casts: response.skill_casts ?? current?.skill_casts,
        skills: response.skills,
        element_state: current?.element_state,
        visible_answer_ids: response.visible_answer_ids ?? current?.visible_answer_ids,
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
  const mana = skillsQuery.data?.mana ?? 0
  const manaCost = selectedState?.mana_cost ?? 0
  const skillCasts = skillsQuery.data?.skill_casts ?? 0
  const canAfford = manaCost <= 0 || mana >= manaCost
  const manaFill = manaCost > 0 ? Math.max(0, Math.min(1, mana / manaCost)) : 0
  const playerIsTopThree = typeof rankQuery.data?.rank === "number" && rankQuery.data.rank >= 1 && rankQuery.data.rank <= 3
  const selectedIsPvp = !!definition.pvp
  const selectedPvpBlocked = !isStaff && selectedIsPvp && playerIsTopThree
  const selectedPvpRankPending = !isStaff && selectedIsPvp && rankQuery.isPending
  const activationPending = activation.isPending
  const isElemental = selectedState?.is_elemental ?? isElementalSkillId(definition.id)
  const isUltimate = selectedState?.is_ultimate ?? isUltimateSkillId(definition.id)
  const lockedText = gameSkillLockLabel("locked", { isElemental, isUltimate })
  const resonance = !isStaff && selectedState?.resonance ? GAME_SKILL_RESONANCES[definition.id] : undefined
  const resonanceAccent = resonance ? getResonanceAccent(resonance.element) : ""
  const escalateMult = (100 + 8 * skillCasts) / 100

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
        className="skill-info-card game-liquid border-2 border-black/80 shadow-[8px_8px_0_0_#0a0c0b]"
      >
        <div className="skill-info-card-art" data-skill={definition.id} aria-hidden />
        <div className="flex max-h-[inherit] flex-col gap-3 overflow-y-auto overscroll-contain p-4">
          <header className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-black/80 bg-(--accent-orb)/15 text-(--accent-orb) shadow-[3px_3px_0_0_#0a0c0b]">
              <GameSkillIcon skillId={definition.id} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="skill-info-title" className="text-base leading-tight font-bold text-white">
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
            <p className="rounded-md border-2 border-black/60 bg-black/25 px-3 py-2 text-xs leading-relaxed text-white/70 shadow-[2px_2px_0_0_#0a0c0b]">
              {definition.condition}
            </p>
          ) : null}
          {resonance ? (
            <div
              className="flex items-start gap-2.5 rounded-lg border px-3 py-2"
              style={{ borderColor: `${resonanceAccent}66`, backgroundColor: `${resonanceAccent}14` }}
            >
              <Image
                src={getResonanceIconSrc(resonance.element)}
                alt=""
                width={20}
                height={20}
                className="mt-0.5 size-5 shrink-0 object-contain"
              />
              <p className="text-xs leading-relaxed text-white/80">
                <span className="font-semibold" style={{ color: resonanceAccent }}>
                  Резонанс · {resonance.title}.
                </span>{" "}
                {resonance.detail}
              </p>
            </div>
          ) : null}
          {selectedPvpBlocked ? (
            <p className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100">
              {definition.title} недоступен: сейчас вы занимаете место в топ-3.
            </p>
          ) : null}
          {!isStaff && manaCost > 0 ? (
            <div className="space-y-1.5 rounded-md border-2 border-black/60 bg-black/25 px-3 py-2 shadow-[2px_2px_0_0_#0a0c0b]">
              <div className="flex items-center justify-between gap-2 text-xs text-white/75">
                <span>
                  Стоимость <span className="font-semibold tabular-nums text-white">{manaCost}</span>
                </span>
                <span className="tabular-nums">
                  {mana}/{manaCost}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/35" role="progressbar" aria-valuemin={0} aria-valuemax={manaCost} aria-valuenow={Math.min(mana, manaCost)} aria-label="Накопление маны до стоимости">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${Math.round(manaFill * 100)}%`,
                    background: "color-mix(in srgb, var(--accent-orb) 80%, white 10%)",
                  }}
                />
              </div>
              {skillCasts > 0 ? (
                <p className="text-[0.7rem] leading-snug text-white/55">
                  +8% за каждый каст · сейчас ×{escalateMult.toFixed(2)}
                </p>
              ) : (
                <p className="text-[0.7rem] leading-snug text-white/45">Каждый каст поднимает цену следующих на +8%</p>
              )}
            </div>
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
                <p className="rounded-md border-2 border-black/60 bg-black/25 px-3 py-2 text-xs leading-relaxed text-white/70 shadow-[2px_2px_0_0_#0a0c0b]">
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
              disabled={
                selectedStatus !== "available" ||
                activationPending ||
                selectedPvpBlocked ||
                selectedPvpRankPending ||
                !questionId ||
                !canAfford
              }
              className="glass-start-btn-primary-palette mt-1 h-11 w-full rounded-xl font-bold text-white hover:bg-transparent"
            >
              {activationPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {selectedStatus === "active"
                ? "Активна на этом вопросе"
                : selectedStatus === "used"
                  ? "Уже использована"
                  : selectedStatus === "locked"
                    ? lockedText
                    : selectedPvpBlocked
                      ? "Недоступно в топ-3"
                      : selectedPvpRankPending
                        ? "Проверяем место…"
                        : !canAfford
                          ? "Не хватает маны"
                          : manaCost > 0
                            ? `Активировать · ${manaCost}`
                            : "Активировать"}
            </Button>
          )}
        </div>
      </article>
    </>
  )
}

export default ComponentInfoSkill
