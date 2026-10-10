"use client"

import { Loader2Icon, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState, type CSSProperties } from "react"

import Button from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { ElementAbilityEffectList } from "@/components/elements/ElementAbilityEffectList"

import { cn } from "@/lib/utils"
import type { IUser } from "@/interface/user"
import { EUserElement } from "@/enum/element"
import { patchUserElement } from "@/api/user"
import { showToast } from "@/stores/toast"
import { useAuth, dispatchSetUser } from "@/stores/auth"
import { setUserQueryCache, useUserByTgId } from "@/queries/user"
import { getMyCharacters, type ICharacterCard } from "@/api/characters"
import { getElementThemeUpdatedToastMessage } from "@/lib/element-theme-toast"
import { dispatchCloseElementsUser, useElementsUser } from "@/stores/elements-user"
import { GAME_ELEMENT_CARDS, type GameElementCard } from "@/lib/game-elements-catalog"
import { resolverUpdateUserElementFormData, type UpdateUserElementFormData } from "@/schemas/update-user-element"

import styles from "./style.module.scss"

function formatPoints(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value)
}

function ElementProgressStrip({
  character,
  fallbackLevel,
  fallbackName,
  accent,
  loading,
}: {
  character: ICharacterCard | undefined
  fallbackLevel?: number
  fallbackName?: string
  accent: string
  loading?: boolean
}) {
  const level = character?.current_level ?? fallbackLevel
  const name = character?.name ?? fallbackName

  if (level == null) {
    return (
      <div className="mt-1.5 rounded-md border border-white/10 bg-white/4 px-2 py-1.5">
        <p className="text-[0.6rem] text-white/45">{loading ? "Загрузка уровня…" : "Уровень пока неизвестен"}</p>
      </div>
    )
  }

  const atCap = level >= 50
  const progress = character != null ? Math.min(100, Math.max(0, character.progress_percent)) : null

  return (
    <div className="mt-1.5 rounded-md border px-2 py-1.5" style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0c` }}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <span className="text-[0.65rem] font-semibold tabular-nums" style={{ color: accent }}>
          Ур. {level}
          {name ? <span className="ml-1 font-medium text-white/55">· {name}</span> : null}
        </span>
        {character != null ? (
          <span className="text-[0.55rem] text-white/50 tabular-nums">
            {atCap ? "Максимум" : `до ${level + 1}: ${formatPoints(character.points_to_next_level)}`}
          </span>
        ) : (
          <span className="text-[0.55rem] text-white/45">опыт на странице персонажа</span>
        )}
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
        <div
          className="h-full rounded-full transition-[width] duration-200"
          style={{ width: `${progress ?? (atCap ? 100 : 0)}%`, backgroundColor: accent }}
        />
      </div>
      {character != null ? (
        <p className="mt-0.5 text-[0.55rem] text-white/45 tabular-nums">{formatPoints(character.total_points)} опыта</p>
      ) : null}
      <span className="sr-only">
        Уровень {level}
        {progress != null ? `, прогресс ${progress} процентов` : ""}
      </span>
    </div>
  )
}

function ElementPickerOption({
  card,
  selected,
  onSelect,
  character,
  fallbackLevel,
  fallbackName,
  loading,
}: {
  card: GameElementCard
  selected: boolean
  onSelect: () => void
  character: ICharacterCard | undefined
  fallbackLevel?: number
  fallbackName?: string
  loading?: boolean
}) {
  const accent = card.accentColor
  const characterLevel = character?.current_level ?? fallbackLevel

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-lg border p-2 text-left transition-[box-shadow,border-color,ring-color] duration-150",
        "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-1",
        selected ? cn(styles.optionSelected, "ring-2 ring-white/55") : "hover:border-white/22",
      )}
      style={
        selected
          ? ({
              "--element-accent": accent,
              borderColor: `color-mix(in srgb, ${accent} 55%, white 45%)`,
              backgroundColor: `${accent}18`,
            } as CSSProperties)
          : {
              borderColor: `${accent}40`,
              backgroundColor: `${accent}08`,
            }
      }
    >
      <div className="flex min-w-0 items-start gap-2">
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-md border p-1"
          style={{ borderColor: `${accent}50`, backgroundColor: `${accent}12` }}
        >
          <img src={card.iconSrc} alt="" className="size-5 object-contain" draggable={false} />
        </div>
        <div className="min-w-0 flex-1 pt-px">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold tracking-tight" style={{ color: accent }}>
              {card.name}
            </span>
            {characterLevel != null ? (
              <span
                className="inline-flex rounded-full border px-1.5 py-px text-[0.55rem] font-bold tabular-nums"
                style={{ borderColor: `${accent}55`, color: accent, backgroundColor: `${accent}14` }}
              >
                {characterLevel} ур.
              </span>
            ) : null}
            <span
              className="inline-flex rounded-full border px-1.5 py-px text-[0.55rem] font-semibold tracking-widest uppercase"
              style={{ borderColor: `${accent}44`, color: accent, backgroundColor: `${accent}10` }}
            >
              {card.tagline}
            </span>
          </div>
          <p className="mt-0.5 text-[0.6rem] font-medium text-white/45">{card.archetype}</p>
          <p className="mt-1 text-[0.65rem] leading-snug text-white/72">{card.description}</p>
        </div>
      </div>

      <ElementProgressStrip
        character={character}
        fallbackLevel={fallbackLevel}
        fallbackName={fallbackName}
        accent={accent}
        loading={loading}
      />

      <blockquote
        className="mt-1.5 rounded-md border px-2 py-1.5 text-[0.6rem] leading-snug text-white/68 italic"
        style={{ borderColor: `${accent}28`, backgroundColor: `${accent}0a` }}
      >
        {card.uiHint}
      </blockquote>

      <div
        className={cn("mt-1.5 grid min-w-0 gap-1.5", card.shortcomings.length > 0 ? "grid-cols-1 min-[400px]:grid-cols-2" : "grid-cols-1")}
      >
        <ElementAbilityEffectList
          title="Бонусы"
          effects={card.bonuses}
          variant="bonus"
          accentColor={accent}
          characterLevel={characterLevel}
          density="compact"
        />
        <ElementAbilityEffectList
          title="Недостатки"
          effects={card.shortcomings}
          variant="penalty"
          accentColor={accent}
          characterLevel={characterLevel}
          density="compact"
        />
      </div>
    </button>
  )
}

function ElementsUser() {
  const queryClient = useQueryClient()
  const user = useAuth(({ user }) => user)
  const [submitting, setSubmitting] = useState(false)
  const isOpen = useElementsUser(({ isOpen }) => isOpen)
  const { data: profile } = useUserByTgId(user?.telegram_id, { enabled: !!user?.telegram_id && isOpen })
  const charactersQuery = useQuery({
    queryKey: ["characters", "me"],
    queryFn: getMyCharacters,
    enabled: !!user?.telegram_id && isOpen,
  })

  const characterByElement = useMemo(() => {
    const map = new Map<string, ICharacterCard>()
    for (const card of charactersQuery.data?.characters ?? []) {
      map.set(card.element, card)
    }
    return map
  }, [charactersQuery.data?.characters])

  const summaryByElement = useMemo(() => {
    const map = new Map<string, { current_level: number; name: string }>()
    for (const item of profile?.characters_summary ?? []) {
      map.set(item.element, { current_level: item.current_level, name: item.name })
    }
    return map
  }, [profile?.characters_summary])

  const { control, handleSubmit, reset } = useForm<UpdateUserElementFormData>({
    resolver: resolverUpdateUserElementFormData,
    defaultValues: { element: EUserElement.FIRE },
  })

  useEffect(() => {
    if (!isOpen || !profile) return
    reset({ element: profile.element ?? undefined })
  }, [isOpen, profile, reset])

  const onSubmit = handleSubmit(async (data) => {
    if (submitting || !user?.telegram_id) return

    if (profile?.element === data.element) {
      dispatchCloseElementsUser()
      return
    }

    setSubmitting(true)
    try {
      const updated = await patchUserElement(data.element as EUserElement)
      const merged: IUser = { ...user, ...updated, element: updated.element ?? (data.element as EUserElement) }
      setUserQueryCache(queryClient, merged)
      dispatchSetUser(merged)
      showToast(getElementThemeUpdatedToastMessage(data.element as EUserElement))
      dispatchCloseElementsUser()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  })

  if (!isOpen || !user) return null

  return (
    <div
      className={cn(styles.wrapper, "fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-3")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="elements-user-title"
      onClick={dispatchCloseElementsUser}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          styles.form,
          "bg-background border-border/80 relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl border sm:rounded-2xl sm:backdrop-blur-xl",
        )}
      >
        <header className="border-border/60 flex shrink-0 items-start justify-between gap-2 border-b px-3 py-3 sm:px-4">
          <div className="min-w-0 space-y-0.5">
            <h2 id="elements-user-title" className="text-foreground text-sm font-semibold tracking-tight">
              {profile?.element ? "Сменить стихию" : "Выберите стихию"}
            </h2>
            <p className="text-muted-foreground text-[0.65rem] leading-snug">
              Необязательно, но даёт бонусы и недостатки в игре. Серые способности ещё не открыты уровнем персонажа. Можно изменить до
              старта раунда.
            </p>
          </div>
          <Button type="button" size="icon-sm" variant="ghost" onClick={dispatchCloseElementsUser} aria-label="Закрыть">
            <X className="size-3.5" aria-hidden />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5 sm:px-4">
          <Controller
            control={control}
            name="element"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-2">
                <FieldLabel className="sr-only">Стихия</FieldLabel>
                <div className="flex flex-col gap-2" role="radiogroup" aria-label="Стихия">
                  {GAME_ELEMENT_CARDS.map((card) => {
                    const summary = summaryByElement.get(card.id)
                    return (
                      <ElementPickerOption
                        key={card.id}
                        card={card}
                        selected={field.value === card.id}
                        onSelect={() => field.onChange(card.id)}
                        character={characterByElement.get(card.id)}
                        fallbackLevel={summary?.current_level}
                        fallbackName={summary?.name}
                        loading={charactersQuery.isLoading}
                      />
                    )
                  })}
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="border-border/60 bg-muted/20 flex shrink-0 flex-col gap-1.5 border-t px-3 py-3 sm:px-4">
          <Button type="submit" disabled={submitting} size="sm" className="h-9 w-full rounded-lg font-semibold">
            {submitting ? (
              <span className="inline-flex items-center gap-1.5 text-xs">
                <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
                Сохранение…
              </span>
            ) : (
              "Сохранить"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={submitting}
            className="h-8 w-full rounded-lg text-xs"
            onClick={dispatchCloseElementsUser}
          >
            Позже
          </Button>
        </div>
      </form>
    </div>
  )
}

ElementsUser.displayName = "ElementsUser"
export default ElementsUser
