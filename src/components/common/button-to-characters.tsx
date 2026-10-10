"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRightIcon, Sparkles } from "lucide-react"

import Button from "@/components/ui/button"
import { EUserElement } from "@/enum/element"
import { GAME_ELEMENT_VISUAL_BY_ID } from "@/lib/game-elements-catalog"
import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import { useAuth } from "@/stores/auth"

import styles from "@/components/styles/button-to.module.scss"

const CHARACTER_ELEMENTS = [EUserElement.FIRE, EUserElement.WATER, EUserElement.EARTH, EUserElement.AIR] as const

function ButtonToCharacters() {
  const telegramId = useAuth((state) => state.user?.telegram_id)
  const { data } = useUserByTgId(telegramId, { enabled: !!telegramId })
  const levelByElement = new Map(data?.characters_summary?.map((item) => [item.element, item.current_level]))

  const levelLabel = CHARACTER_ELEMENTS.map((element) => {
    const visual = GAME_ELEMENT_VISUAL_BY_ID[element]
    return `${visual.name} ${levelByElement.get(element) ?? 0}`
  }).join(", ")

  return (
    <Button asChild variant="outline" className={cn("h-auto justify-between overflow-hidden rounded-2xl px-4 py-3 text-left", styles.button, styles.toneOne)}>
      <Link href="/characters" aria-label={`Мои персонажи. ${levelLabel}`}>
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className={cn("bg-background/60 flex size-9 shrink-0 items-center justify-center rounded-xl border", styles.buttonIcon)}>
            <Sparkles className="size-4 text-current" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-current">Мои персонажи</span>
            <span className="mt-1.5 flex flex-wrap gap-1">
              {CHARACTER_ELEMENTS.map((element) => {
                const visual = GAME_ELEMENT_VISUAL_BY_ID[element]
                const level = levelByElement.get(element) ?? 0
                return (
                  <span
                    key={element}
                    className="inline-flex items-center gap-1 rounded-md border border-current/15 bg-background/50 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-current"
                    title={`${visual.name}, уровень ${level}`}
                  >
                    <Image src={visual.iconSrc} alt="" width={12} height={12} className="size-3 object-contain" />
                    {level}
                  </span>
                )
              })}
            </span>
          </span>
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-current" aria-hidden />
      </Link>
    </Button>
  )
}

ButtonToCharacters.displayName = "ButtonToCharacters"
export default ButtonToCharacters
