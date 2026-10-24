"use client"

import { ChevronRight } from "lucide-react"

import ElementMarkIcon from "@/components/icons/ElementMarkIcon"

import { cn } from "@/lib/utils"
import { dispatchOpenElementsUser } from "@/stores/elements-user"

import promptStyles from "@/components/common/ElementsUserButton.module.scss"

function ElementPickPromptBanner() {
  return (
    <button
      type="button"
      onClick={dispatchOpenElementsUser}
      title="Выберите стихию"
      aria-label="Выберите стихию — открыть выбор"
      className={cn(
        "glass-start-liquid-palette group w-full shrink-0 rounded-xl p-3 text-left sm:p-3.5",
        "cursor-pointer transition-[transform,box-shadow] hover:translate-x-px hover:translate-y-px",
        "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--accent-orb)/70",
        promptStyles.promptButton,
      )}
    >
      <span className="flex w-full items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-md border-2 border-black/80 bg-(--accent-orb)/15 shadow-[3px_3px_0_0_#0a0c0b] sm:size-11"
          aria-hidden
        >
          <ElementMarkIcon className="size-5 shrink-0 text-(--accent-orb)" />
        </span>
        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="block text-sm font-bold tracking-tight text-white sm:text-[0.95rem]">Выберите стихию</span>
          <span className="block text-[0.68rem] leading-snug text-white/58 sm:text-xs">
            Огонь, вода, земля или воздух — дают бонусы и недостатки к очкам. Можно сменить до старта раунда.
          </span>
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70"
          aria-hidden
        />
      </span>
    </button>
  )
}

ElementPickPromptBanner.displayName = "ElementPickPromptBanner"
export default ElementPickPromptBanner
