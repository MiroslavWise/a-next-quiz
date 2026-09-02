"use client"

import { useState } from "react"
import { Loader2Icon, X } from "lucide-react"
import { useShallow } from "zustand/react/shallow"
import { Controller, useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"

import Input from "@/components/ui/input"
import Button from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { cn } from "@/lib/utils"
import { useAuthJwtClaims } from "@/lib/jwt"
import { patchUserProfile } from "@/api/user"
import type { IUser } from "@/interface/user"
import { setUserQueryCache } from "@/queries/user"
import { BG_OPTIONS, BG_OPTIONS_MANAGERS } from "./bg"
import { USER_AVATAR_OPTIONS } from "./avatar-options"
import { useAuth, dispatchSetUser } from "@/stores/auth"
import { dispatchCloseUpdateInfo, useUpdateInfo } from "@/stores/update-info"
import { resolverUpdateUserFormData, type UpdateUserFormData } from "@/schemas/update-user"

import styles from "./style.module.css"

function UpdateInfoUser() {
  const queryClient = useQueryClient()
  const user = useAuth(({ user }) => user)
  const claims = useAuthJwtClaims()
  const isAdmin = claims?.is_admin ?? false
  const isManager = claims?.is_manager ?? false
  const isAdminOrManager = isAdmin || isManager

  const { avatar, pseudo, bg, isOpen } = useUpdateInfo(
    useShallow((s) => ({
      avatar: s.avatar,
      pseudo: s.pseudo,
      bg: s.bg,
      isOpen: s.isOpen,
    })),
  )
  const [submitting, setSubmitting] = useState(false)

  const { control, handleSubmit } = useForm<UpdateUserFormData>({
    defaultValues: {
      pseudo: pseudo,
      avatar: avatar,
      bg: bg,
    },
    resolver: resolverUpdateUserFormData,
  })

  const onSubmit = handleSubmit(async (data) => {
    if (submitting || !user?.telegram_id) return
    setSubmitting(true)
    try {
      const patchBody: Partial<UpdateUserFormData> = {}
      if (data.pseudo && data.pseudo.trim() !== user?.pseudo?.trim()) patchBody.pseudo = data.pseudo
      if (data.avatar && data.avatar.trim() !== user?.avatar?.trim()) patchBody.avatar = data.avatar
      if (data.bg && data.bg.trim() !== user?.bg?.trim()) patchBody.bg = data.bg

      if (Object.keys(patchBody).length !== 0) {
        const updated = await patchUserProfile(patchBody)
        const merged: IUser = {
          ...user,
          ...updated,
          pseudo: updated.pseudo?.trim() ? updated.pseudo : data.pseudo,
          photo_url: updated.photo_url?.trim() ? updated.photo_url : data.avatar,
        }
        setUserQueryCache(queryClient, merged)
        dispatchSetUser(merged)
      }
      dispatchCloseUpdateInfo()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  })

  const COLORS = BG_OPTIONS.concat(isAdminOrManager ? BG_OPTIONS_MANAGERS : [])

  if (!isOpen || !user) return null

  return (
    <div
      className={cn(styles.wrapper, "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain p-4")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-user-title"
    >
      <form
        onSubmit={onSubmit}
        className="bg-background border-border/80 relative z-10 my-auto w-full max-w-md overflow-hidden rounded-2xl border backdrop-blur-xl"
      >
        {!!avatar && !!pseudo && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={dispatchCloseUpdateInfo}
            aria-label="Закрыть"
            className="absolute top-4 right-4"
          >
            <X className="size-4" aria-hidden />
          </Button>
        )}
        <div className="space-y-6 py-4">
          <Controller
            control={control}
            name="pseudo"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-2 px-4">
                <FieldLabel htmlFor="update-user-pseudo" className="text-foreground text-xs font-medium">
                  Кличка
                </FieldLabel>
                <Input
                  id="update-user-pseudo"
                  {...field}
                  autoComplete="off"
                  placeholder="Например, «Кот в сапогах»"
                  aria-invalid={fieldState.invalid}
                  className="border-border/80 bg-background/80 h-11 rounded-xl"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="bg"
            render={({ field, fieldState }) => (
              <>
                <Field data-invalid={fieldState.invalid} className="space-y-3 px-4">
                  <FieldLabel className="text-foreground text-xs font-medium">Фон</FieldLabel>
                  <div className="-mx-4 w-[calc(100%+2rem)]! overflow-x-auto [-webkit-overflow-scrolling:touch]">
                    <div
                      className="grid w-max auto-cols-[3.25rem] grid-flow-col grid-rows-1 gap-2 px-4 sm:auto-cols-[3.5rem]"
                      role="listbox"
                      aria-label="Выбор фона"
                    >
                      {COLORS.map((color) => {
                        const selected = field.value === color
                        const inlineBg = color ? { backgroundColor: color } : undefined

                        return (
                          <button
                            key={color || "transparent"}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => field.onChange(color)}
                            className={cn(
                              "relative aspect-square overflow-hidden rounded-full border-2 transition-[transform,ring] duration-150",
                              "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2",
                              selected
                                ? "border-primary ring-primary/35 ring-offset-background ring-2 ring-offset-2"
                                : "border-border/70 bg-muted/30 hover:border-border hover:bg-muted/50",
                            )}
                            style={inlineBg}
                          >
                            {selected ? <span className="bg-primary absolute inset-x-2 bottom-1 h-1 rounded-full" aria-hidden /> : null}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
                <Controller
                  control={control}
                  name="avatar"
                  render={({ field: avatarField, fieldState: avatarFieldState }) => (
                    <Field data-invalid={avatarFieldState.invalid} className="space-y-3 px-4">
                      <FieldLabel className="text-foreground text-xs font-medium">Аватар</FieldLabel>
                      <div className="-mx-4 w-[calc(100%+2rem)]! overflow-x-auto [-webkit-overflow-scrolling:touch]">
                        <div
                          className="grid w-max auto-cols-[2.75rem] grid-flow-col grid-rows-4 gap-2 px-4 sm:auto-cols-[3rem]"
                          role="listbox"
                          aria-label="Выбор аватара"
                        >
                          {USER_AVATAR_OPTIONS.map((url) => {
                            const selected = avatarField.value === url
                            return (
                              <button
                                key={url}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => avatarField.onChange(url)}
                                className={cn(
                                  "relative aspect-square overflow-hidden rounded-xl border-2 transition-[transform,ring] duration-150",
                                  "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2",
                                  selected
                                    ? "border-primary ring-primary/35 ring-offset-background ring-2 ring-offset-2"
                                    : "border-border/70 hover:border-border",
                                )}
                                style={{ backgroundColor: field.value || "transparent" }}
                              >
                                <Avatar className="size-full rounded-xl">
                                  <AvatarImage src={url} alt="" className="rounded-xl border-none! object-cover" />
                                  <AvatarFallback className="rounded-xl text-[0.65rem]">?</AvatarFallback>
                                </Avatar>
                                {selected ? <span className="bg-primary absolute inset-x-1 bottom-1 h-1 rounded-full" aria-hidden /> : null}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      {avatarFieldState.invalid && <FieldError errors={[avatarFieldState.error]} />}
                    </Field>
                  )}
                />
              </>
            )}
          />
        </div>
        <div className="border-border/60 bg-muted/20 flex w-full flex-col-reverse gap-2 border-t px-6 py-4">
          <Button type="submit" disabled={submitting} className="h-11 w-full rounded-xl font-semibold">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Сохранение…
              </span>
            ) : (
              "Сохранить и продолжить"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

UpdateInfoUser.displayName = "UpdateInfoUser"
export default UpdateInfoUser
