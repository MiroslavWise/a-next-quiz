"use client"

import { Loader2Icon, X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, type CSSProperties } from "react"

import Button from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

import { cn } from "@/lib/utils"
import type { IUser } from "@/interface/user"
import { EUserElement } from "@/enum/element"
import { getElementThemeUpdatedToastMessage } from "@/lib/element-theme-toast"
import { patchUserElement } from "@/api/user"
import { showToast } from "@/stores/toast"
import { useAuth, dispatchSetUser } from "@/stores/auth"
import { setUserQueryCache, useUserByTgId } from "@/queries/user"
import { dispatchCloseElementsUser, useElementsUser } from "@/stores/elements-user"
import { GAME_ELEMENT_CARDS, type GameElementCard } from "@/lib/game-elements-catalog"
import { resolverUpdateUserElementFormData, type UpdateUserElementFormData } from "@/schemas/update-user-element"

import styles from "./style.module.scss"

function ElementEffectListCompact({
  title,
  effects,
  variant,
  accentColor,
}: {
  title: string
  effects: GameElementCard["bonuses"]
  variant: "bonus" | "penalty"
  accentColor: string
}) {
  if (effects.length === 0) return null

  return (
    <div className="min-w-0">
      <p className="mb-1 text-[0.55rem] font-semibold tracking-[0.12em] text-white/45 uppercase">{title}</p>
      <ul className="flex min-w-0 flex-col gap-1">
        {effects.map((effect) => (
          <li
            key={effect.id}
            className={cn(
              "rounded-md border px-2 py-1.5",
              variant === "bonus" ? "border-white/10 bg-white/5" : "border-red-400/20 bg-red-500/8",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-1.5 gap-y-0">
              <span className="text-[0.65rem] font-semibold" style={{ color: variant === "bonus" ? accentColor : "#fca5a5" }}>
                {effect.title}
              </span>
              <span className="text-[0.55rem] font-medium tracking-wide text-white/50 tabular-nums">{effect.short}</span>
            </div>
            <p className="mt-0.5 text-[0.6rem] leading-snug text-white/58">{effect.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ElementPickerOption({ card, selected, onSelect }: { card: GameElementCard; selected: boolean; onSelect: () => void }) {
  const accent = card.accentColor

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

      <blockquote
        className="mt-1.5 rounded-md border px-2 py-1.5 text-[0.6rem] leading-snug text-white/68 italic"
        style={{ borderColor: `${accent}28`, backgroundColor: `${accent}0a` }}
      >
        {card.uiHint}
      </blockquote>

      <div className={cn("mt-1.5 grid min-w-0 gap-1.5", card.penalties.length > 0 ? "grid-cols-1 min-[400px]:grid-cols-2" : "grid-cols-1")}>
        <ElementEffectListCompact title="Бонусы" effects={card.bonuses} variant="bonus" accentColor={accent} />
        <ElementEffectListCompact title="Штрафы" effects={card.penalties} variant="penalty" accentColor={accent} />
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
              Необязательно, но даёт бонусы и штрафы в игре. Ошибка или пропуск могут отнять очки — итоговая сумма может стать
              отрицательной. Можно изменить до старта раунда.
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
                  {GAME_ELEMENT_CARDS.map((card) => (
                    <ElementPickerOption
                      key={card.id}
                      card={card}
                      selected={field.value === card.id}
                      onSelect={() => field.onChange(card.id)}
                    />
                  ))}
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
