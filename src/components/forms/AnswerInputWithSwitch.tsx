import { type ComponentProps, type FocusEvent, type KeyboardEvent } from "react"

import Input from "../ui/input"
import Switch from "../ui/switch"

import { cn } from "@/lib/utils"

/**
 * iOS и Telegram при фокусе сдвигают window, хотя прокрутка формы живёт в `main`.
 * `scrollIntoView` и `transform` на самом input это усиливают: экран уезжает вверх,
 * иногда весь интерфейс оказывается вне visual viewport, пока ввод не заставит WebKit перерисовать слой.
 */
function bindAnswerFieldViewport(input: HTMLInputElement) {
  const viewport = window.visualViewport

  const pinDocument = () => {
    if (window.scrollX === 0 && window.scrollY === 0) return
    window.scrollTo(0, 0)
  }

  let frame = 0
  const keepFieldVisible = () => {
    pinDocument()
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      if (!input.isConnected) return
      const scroller = input.closest("main")
      if (!(scroller instanceof HTMLElement)) return

      const rect = input.getBoundingClientRect()
      const top = viewport?.offsetTop ?? 0
      const bottom = top + (viewport?.height ?? window.innerHeight)
      const margin = 16

      if (rect.bottom > bottom - margin) {
        scroller.scrollTop += rect.bottom - (bottom - margin)
      } else if (rect.top < top + margin) {
        scroller.scrollTop -= top + margin - rect.top
      }
    })
  }

  keepFieldVisible()
  const later = window.setTimeout(keepFieldVisible, 300)

  const onViewportScroll = () => {
    pinDocument()
  }

  viewport?.addEventListener("scroll", onViewportScroll)
  viewport?.addEventListener("resize", keepFieldVisible)

  const stop = () => {
    window.clearTimeout(later)
    cancelAnimationFrame(frame)
    viewport?.removeEventListener("scroll", onViewportScroll)
    viewport?.removeEventListener("resize", keepFieldVisible)
    input.removeEventListener("blur", stop)
  }
  input.addEventListener("blur", stop)
}

type Props = {
  index: number
  inputProps: ComponentProps<typeof Input>
  switchId: string
  checked: boolean
  color: string
  invalid?: boolean
  onCheckedChange: (value: boolean) => void
}

export function AnswerInputWithSwitch({ index, inputProps, switchId, checked, color, invalid, onCheckedChange }: Props) {
  const { className: inputClassName, onKeyDown, onFocus, ...restInputProps } = inputProps

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    // «Ввод» на мобиле сабмитит форму → валидация → ререндер → WebKit перестаёт рисовать текст.
    if (event.key === "Enter") event.preventDefault()
  }

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    onFocus?.(event)
    bindAnswerFieldViewport(event.currentTarget)
  }

  return (
    <div
      className={cn(
        "flex h-10 w-full min-w-0 items-center gap-1.5 rounded-lg border border-white/20 pr-2 outline-none",
        color,
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        invalid &&
          "border-destructive ring-[3px] ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
      )}
    >
      <Input
        {...restInputProps}
        data-index={index}
        aria-invalid={invalid}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        className={cn(
          "h-10 min-h-10 min-w-0 flex-1 border-0 bg-transparent shadow-none dark:bg-transparent",
          "text-base text-white caret-white placeholder:text-white/60",
          "select-text [-webkit-user-select:text]",
          "[-webkit-text-fill-color:white] focus:[-webkit-text-fill-color:white]",
          "focus-visible:border-transparent focus-visible:ring-0 aria-invalid:ring-0",
          inputClassName,
        )}
      />
      <Switch
        id={switchId}
        checked={checked}
        aria-label="Верный ответ"
        className={cn("shrink-0", checked ? "bg-white/35" : "bg-black/35")}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}
