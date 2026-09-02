"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

import { cn } from "@/lib/utils"
import type { EUserElement } from "@/enum/element"
import { dispatchOpenElementsUser } from "@/stores/elements-user"

import styles from "./ElementsUserButton.module.scss"

const DEFAULT_BUTTON_CLASS = cn(
  "inline-flex aspect-square shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/8 px-2 py-1.5",
  "text-white/90",
  "transition-colors hover:border-white/25 hover:bg-white/12",
  "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white/40",
  "disabled:pointer-events-none disabled:opacity-50",
)

export interface ElementsUserButtonProps {
  className?: string
  disabled?: boolean
  onClick?: () => void
  /** Стихия из профиля; без неё кнопка подсвечивается цветами стихий. */
  element?: EUserElement | null
}

function ElementsUserButton({ className, disabled, onClick, element }: ElementsUserButtonProps) {
  const needsElementPrompt = element == null && !disabled

  return (
    <button
      type="button"
      title={needsElementPrompt ? "Выберите стихию" : "Стихии"}
      aria-label={needsElementPrompt ? "Выберите стихию" : "Стихии"}
      disabled={disabled}
      onClick={onClick ?? dispatchOpenElementsUser}
      className={cn(className ?? DEFAULT_BUTTON_CLASS, needsElementPrompt && styles.promptButton)}
    >
      <DotLottieReact src="/lottie/elements.lottie" loop autoplay backgroundColor="transparent" className="size-3.5 shrink-0" />
    </button>
  )
}

ElementsUserButton.displayName = "ElementsUserButton"
export default ElementsUserButton
