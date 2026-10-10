import Link from "next/link"

import type { ICharacterAward } from "@/api/characters"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"
import { cn } from "@/lib/utils"
import type { EUserElement } from "@/enum/element"

function formatXp(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value)
}

function elementName(element: EUserElement | undefined) {
  if (!element) return "Стихия"
  return GAME_ELEMENT_VISUAL_BY_ID[element]?.name ?? element
}

export default function CharacterAwardBlock({ award }: { award?: ICharacterAward | null }) {
  if (!award) return null

  if (award.kind === "none") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80" role="status">
        Выбери стихию в профиле, чтобы копить опыт персонажа.
      </div>
    )
  }

  if (award.kind === "avatar") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85" role="status">
        <p className="font-semibold text-white">Аватар</p>
        <p className="mt-1">Опыт разделён на 4 персонажа{award.shares?.[0] ? ` — по ${formatXp(award.shares[0].points_gained)} каждому` : ""}.</p>
        <Link href="/characters" className="mt-2 inline-flex text-xs font-medium text-(--accent-orb) underline-offset-2 hover:underline">
          Открыть персонажей
        </Link>
      </div>
    )
  }

  const visual = award.element ? GAME_ELEMENT_VISUAL_BY_ID[award.element] : undefined
  const leveled = (award.level_after ?? 0) > (award.level_before ?? 0)
  const notes = [
    award.top_percent ? `+${award.top_percent}% за топ-${award.top_percent === 7 ? 1 : award.top_percent === 5 ? 2 : 3}` : "",
    award.prize_percent ? `+${award.prize_percent}% за приз` : "",
  ].filter(Boolean)

  return (
    <div className="rounded-2xl border px-4 py-3 text-sm text-white" role="status" style={{ borderColor: visual?.accentColor ?? "rgba(255,255,255,0.12)" }}>
      <p className="font-semibold">
        {elementName(award.element)} <span className="tabular-nums">+{formatXp(award.points_gained)} опыта</span>
      </p>
      {notes.length > 0 ? <p className="mt-1 text-xs text-white/70">{notes.join(" · ")}</p> : null}
      {leveled ? (
        <p className={cn("mt-1 text-xs font-medium")} style={{ color: visual?.accentColor }}>
          Уровень {award.level_after}
          {award.unlocked?.length ? `: ${award.unlocked.join(", ")}` : ""}
        </p>
      ) : null}
      {award.element ? (
        <Link href={`/characters/${award.element}`} className="mt-2 inline-flex text-xs font-medium underline-offset-2 hover:underline" style={{ color: visual?.accentColor }}>
          Посмотреть персонажа
        </Link>
      ) : null}
    </div>
  )
}
