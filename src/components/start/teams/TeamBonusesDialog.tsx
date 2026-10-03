"use client"

import { useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"

import Button from "@/components/ui/button"

import type { ITeam } from "@/api/reports"
import { TEAM_BONUSES } from "@/lib/game-team-bonuses"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"
import { useUserByTgId } from "@/queries/user"

export function TeamBonusesDialog({ team, viewerTgId, onClose }: { team: ITeam; viewerTgId: number; onClose: () => void }) {
  const [leftId, rightId] = team.members
  const left = useUserByTgId(leftId, { enabled: !!leftId && !!viewerTgId })
  const right = useUserByTgId(rightId, { enabled: !!rightId && !!viewerTgId })
  const sharedElement = left.data?.element && left.data.element === right.data?.element ? left.data.element : null
  const sharedVisual = sharedElement ? GAME_ELEMENT_VISUAL_BY_ID[sharedElement] : null
  const streak = team.pair_streak ?? 0

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-black/35" aria-label="Закрыть бонусы пары" onClick={onClose} />
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-bonus-title"
        className="skill-info-card glass3d"
        style={{ maxHeight: "min(78svh, 40rem)" }}
      >
        <div className="flex max-h-[inherit] flex-col gap-3 overflow-y-auto overscroll-contain p-4">
          <header className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 id="team-bonus-title" className="text-base leading-tight font-semibold text-white">
                Бонусы пары
              </h2>
              <p className="mt-0.5 text-xs font-medium text-(--accent-orb)">Места и призы остаются личными</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Закрыть"
              onClick={onClose}
              className="shrink-0 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" aria-hidden />
            </Button>
          </header>
          <ul className="flex flex-col gap-2">
            {TEAM_BONUSES.map((bonus) => (
              <li key={bonus.id} className="rounded-xl border border-white/12 bg-white/5 px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="text-sm font-semibold text-white">{bonus.title}</span>
                  <code className="text-[0.6rem] tracking-wide text-white/45">{bonus.id}</code>
                </div>
                <p className="mt-0.5 text-xs font-medium text-(--accent-orb)">{bonus.short}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{bonus.detail}</p>
              </li>
            ))}
          </ul>
          {sharedVisual ? (
            <div
              className="flex items-start gap-2.5 rounded-lg border px-3 py-2"
              style={{ borderColor: `${sharedVisual.accentColor}66`, backgroundColor: `${sharedVisual.accentColor}14` }}
            >
              <Image src={sharedVisual.iconSrc} alt="" width={20} height={20} className="mt-0.5 size-5 shrink-0 object-contain" />
              <p className="text-xs leading-relaxed text-white/80">
                <span className="font-semibold" style={{ color: sharedVisual.accentColor }}>
                  Резонанс включён.
                </span>{" "}
                Оба сейчас — {sharedVisual.name}. На верном ответе обоих каждому +50.
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-white/70">
              Резонанс спит: стихии разные или ещё не выбраны.
            </p>
          )}
          {streak > 0 ? (
            <p className="text-xs leading-relaxed text-white/70">
              Серия пары сейчас: <strong className="text-foreground">{streak}</strong>
            </p>
          ) : null}
        </div>
      </article>
    </>
  )
}
