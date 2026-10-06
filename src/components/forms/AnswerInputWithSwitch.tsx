import { type ComponentProps, type FocusEvent, type KeyboardEvent } from "react"

import Input from "../ui/input"
import Switch from "../ui/switch"

import { cn } from "@/lib/utils"

const KEYBOARD_FIELD_MARGIN = 24

/** Нижняя граница видимой области в той же системе координат, что и getBoundingClientRect. */
function visibleBottom() {
  const viewport = window.visualViewport
  if (!viewport) return window.innerHeight

  const docTop = document.documentElement.getBoundingClientRect().top
  const rectsFollowVisualViewport = Math.abs(docTop + window.scrollY + viewport.offsetTop) < 16
  return rectsFollowVisualViewport ? viewport.height : viewport.offsetTop + viewport.height
}

/** Доскроллить только main, когда клавиатура уже открыта. Окно не трогаем — иначе каждый фокус прыгает. */
function placeAnswerField(input: HTMLInputElement) {
  if (!input.isConnected) return
  const scroller = input.closest("main")
  if (!(scroller instanceof HTMLElement)) return

  const row = input.parentElement ?? input
  const overflow = row.getBoundingClientRect().bottom + KEYBOARD_FIELD_MARGIN - visibleBottom()
  if (overflow > 1) scroller.scrollTop += overflow
}

function bindAnswerFieldViewport(input: HTMLInputElement) {
  const viewport = window.visualViewport
  let timer = 0

  const schedule = () => {
    window.clearTimeout(timer)
    // Несколько resize за анимацию клавиатуры — сдвигаем форму один раз, когда высота устаканилась.
    timer = window.setTimeout(() => placeAnswerField(input), 120)
  }

  viewport?.addEventListener("resize", schedule)
  const fallback = window.setTimeout(() => placeAnswerField(input), 450)

  const stop = () => {
    window.clearTimeout(timer)
    window.clearTimeout(fallback)
    viewport?.removeEventListener("resize", schedule)
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
