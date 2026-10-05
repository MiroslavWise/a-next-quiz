import Image from "next/image"
import { Crown, Gem, Heart, HeartHandshake, Sparkles, Trophy, Users, Zap, type LucideIcon } from "lucide-react"

import type { IMatchTitle } from "@/api/reports"
import { matchTitleById } from "@/content/match-titles"
import { cn } from "@/lib/utils"

const TITLE_ICONS: Record<string, LucideIcon> = {
  first_correct: Zap,
  answer_titan: Crown,
  never_skipped: Gem,
  pair_flawless: Heart,
  pair_unison: Users,
  pair_kin: HeartHandshake,
  pair_spark: Sparkles,
  pair_evening: Trophy,
}

const ELEMENT_ICON_SRC: Record<string, string> = {
  element_fire: "/element/fire.svg",
  element_water: "/element/water.svg",
  element_earth: "/element/earth.svg",
  element_air: "/element/air.svg",
}

export function MatchTitleMark({ id, className }: { id: string; className?: string }) {
  const src = ELEMENT_ICON_SRC[id]
  if (src) {
    return <Image src={src} alt="" width={12} height={12} className={cn("size-3 shrink-0 object-contain", className)} />
  }
  const Icon = TITLE_ICONS[id]
  if (Icon) {
    return <Icon className={cn("size-3 shrink-0", className)} aria-hidden />
  }
  return <span className={cn("size-1.5 shrink-0 rounded-full bg-amber-200/70", className)} aria-hidden />
}

function MatchTitleChip({ id, className }: { id: string; className?: string }) {
  const known = matchTitleById(id)
  if (!known) return null
  const rare = Boolean(known.rare)
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] leading-none font-semibold tracking-wide",
        rare
          ? "border-amber-200/80 bg-amber-900/55 text-amber-50"
          : "border-amber-500/45 bg-amber-950/35 text-amber-200",
        className,
      )}
    >
      <MatchTitleMark id={known.id} className={rare ? "text-amber-100" : undefined} />
      <span className="min-w-0 truncate">{known.title}</span>
    </span>
  )
}

export function MatchTitleChips({
  titles,
  className,
  align = "start",
}: {
  titles?: IMatchTitle[] | null
  className?: string
  align?: "start" | "center"
}) {
  const list = (titles ?? []).flatMap((item) => {
    const known = matchTitleById(item?.id)
    return known ? [known] : []
  })
  if (list.length === 0) return null

  return (
    <ul
      className={cn("flex flex-wrap gap-1.5", align === "center" && "justify-center", className)}
      aria-label="Звания"
    >
      {list.map((item) => (
        <li key={item.id} className="max-w-full min-w-0">
          <MatchTitleChip id={item.id} />
        </li>
      ))}
    </ul>
  )
}
