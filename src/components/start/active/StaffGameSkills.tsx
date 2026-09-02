"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import type { SkillId } from "@/api/reports"
import { UserAvatar } from "@/components/common/UserAvatar"
import Button from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import Skeleton from "@/components/ui/skeleton"
import { GAME_SKILLS, getGameSkillDefinition, type GameSkillDefinition } from "@/enum/game-skill"
import { GameSkillIcon } from "@/lib/game-skill-icons"
import { useUserByTgId } from "@/queries/user"
import { cn } from "@/lib/utils"

import waveSt from "../styles/timer-waves.module.scss"

interface StaffGameSkillsProps {
  bySkillId: Map<SkillId, number[]>
  tgId: number
  /** После END — больше воздуха от графиков/ответов; в GAME компактнее. */
  isQuestionEnded?: boolean
}

function SkillActivatorRow({ telegramId, viewerTgId }: { telegramId: number; viewerTgId: number }) {
  const { data, isLoading } = useUserByTgId(telegramId, {
    enabled: !!telegramId && !!viewerTgId,
  })

  if (isLoading) {
    return (
      <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2.5 rounded-lg bg-muted/60 px-2.5 py-2">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 w-full">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-2.5 w-36 rounded" />
        </div>
      </li>
    )
  }

  const pseudo = data?.pseudo?.trim() || `Пользователь ${telegramId}`
  const fullName =
    [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim() || (data?.username?.trim() ? `@${data.username.trim()}` : "—")

  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2.5 rounded-lg bg-muted/60 px-2.5 py-2 text-left">
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
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 w-full">
        <p className="truncate text-sm leading-tight font-medium text-foreground">{pseudo}</p>
        <p className="truncate text-xs leading-tight text-muted-foreground">{fullName}</p>
      </div>
    </li>
  )
}

function StaffSkillButton({
  definition,
  count,
  onSelect,
}: {
  definition: GameSkillDefinition
  count: number
  onSelect: (skillId: SkillId) => void
}) {
  const prevCountRef = useRef(count)
  const [waveKey, setWaveKey] = useState(0)
  const hasActivations = count > 0

  useEffect(() => {
    if (count > prevCountRef.current) {
      setWaveKey((key) => key + 1)
    }
    prevCountRef.current = count
  }, [count])

  return (
    <div className="relative isolate inline-flex size-9 shrink-0 items-center justify-center overflow-visible">
      {waveKey > 0 ? (
        <span key={waveKey} className={waveSt.waveBurst} style={{ "--wave-max-scale": 2.6 } as CSSProperties} aria-hidden />
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-label={hasActivations ? `${definition.title}. Активировали: ${count}` : `${definition.title}. Пока никто не активировал`}
        aria-pressed={hasActivations}
        title={hasActivations ? `${definition.title}: ${count}` : `${definition.title}: никто не активировал`}
        onClick={() => onSelect(definition.id)}
        className={cn(
          "relative z-10 size-9 rounded-full border-white/15 bg-black/25 text-white/80",
          "hover:border-(--accent-orb)/55 hover:bg-(--accent-orb)/15 hover:text-white",
          hasActivations && "border-(--accent-orb)/70 bg-(--accent-orb)/25 text-white ring-2 ring-(--accent-orb)/35",
        )}
      >
        <GameSkillIcon skillId={definition.id} className="size-4.5" />
        {hasActivations ? (
          <span className="absolute -top-1 -right-1 z-20 flex min-w-4 items-center justify-center rounded-full border border-(--accent-orb)/50 bg-background px-1 text-[10px] leading-4 font-semibold text-(--accent-orb) tabular-nums">
            {count}
          </span>
        ) : null}
      </Button>
    </div>
  )
}

function StaffGameSkills({ bySkillId, tgId, isQuestionEnded = false }: StaffGameSkillsProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId | null>(null)

  // Страховка: vaul оставляет `body { pointer-events: none }` при размонтировании открытого Drawer.
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined" && document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = ""
      }
    }
  }, [])

  const selectedDefinition = selectedSkillId ? getGameSkillDefinition(selectedSkillId) : null
  const selectedActivators = selectedSkillId ? (bySkillId.get(selectedSkillId) ?? []) : []

  return (
    <>
      <section
        className={cn(
          "relative z-10 flex min-h-10 items-center justify-center overflow-visible",
          isQuestionEnded ? "my-3 py-4" : "py-3",
        )}
        aria-label="Способности участников"
      >
        <div className="glass-start-liquid-palette relative flex flex-wrap items-center justify-center gap-2 overflow-visible rounded-full border border-white/12 p-2 shadow-lg shadow-black/15">
          {GAME_SKILLS.map((definition) => (
            <StaffSkillButton
              key={definition.id}
              definition={definition}
              count={(bySkillId.get(definition.id) ?? []).length}
              onSelect={setSelectedSkillId}
            />
          ))}
        </div>
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
                  <p className="mt-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-left text-xs leading-relaxed text-muted-foreground">
                    {selectedDefinition.condition}
                  </p>
                ) : null}
              </DrawerHeader>

              <div className="space-y-2 px-4 pb-6 text-left">
                <p className="text-sm font-medium text-foreground">На этом вопросе</p>
                {selectedActivators.length > 0 ? (
                  <ul
                    className="flex max-h-56 flex-col gap-1.5 overflow-y-auto overscroll-contain"
                    aria-label={`Активировали ${selectedDefinition.title}`}
                  >
                    {selectedActivators.map((telegramId) => (
                      <SkillActivatorRow key={telegramId} telegramId={telegramId} viewerTgId={tgId} />
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                    Пока никто не активировал
                  </p>
                )}
              </div>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  )
}

StaffGameSkills.displayName = "StaffGameSkills"
export default StaffGameSkills
