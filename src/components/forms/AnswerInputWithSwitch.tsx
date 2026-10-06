import { type ComponentProps, type FocusEvent, type KeyboardEvent } from "react"

import Input from "../ui/input"
import Switch from "../ui/switch"

import { cn } from "@/lib/utils"

const KEYBOARD_FIELD_MARGIN = 16

type ShellSnapshot = {
  position: string
  top: string
  left: string
  width: string
  height: string
  justifyContent: string
  mainHeight: string
}

let activeInput: HTMLInputElement | null = null
let shellMain: HTMLElement | null = null
let shellSnapshot: ShellSnapshot | null = null
let releaseTimer = 0
let placeTimer = 0
let watching = false
let stopWatching: (() => void) | null = null

/**
 * body и main стоят на 100svh и overflow:hidden. Клавиатура эту высоту не уменьшает:
 * WebKit сдвигает visual viewport, оболочка остаётся выше клавиатуры и обрезает нижнее поле.
 * На время фокуса оболочка совпадает с видимой областью, форма крутится уже внутри неё.
 */
function applyKeyboardShell() {
  const viewport = window.visualViewport
  const main = shellMain
  if (!viewport || !main) return

  const body = document.body
  if (!shellSnapshot) {
    shellSnapshot = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      height: body.style.height,
      justifyContent: body.style.justifyContent,
      mainHeight: main.style.height,
    }
  }

  const top = `${viewport.offsetTop}px`
  const height = `${viewport.height}px`
  if (body.style.position !== "fixed") body.style.position = "fixed"
  if (body.style.left !== "0px") body.style.left = "0"
  if (body.style.width !== "100%") body.style.width = "100%"
  if (body.style.top !== top) body.style.top = top
  if (body.style.height !== height) body.style.height = height
  if (body.style.justifyContent !== "flex-start") body.style.justifyContent = "flex-start"
  if (main.style.height !== "100%") main.style.height = "100%"
}

function placeAnswerField() {
  applyKeyboardShell()
  const input = activeInput
  const main = shellMain
  if (!input?.isConnected || !main) return

  const row = input.parentElement ?? input
  const overflow = row.getBoundingClientRect().bottom + KEYBOARD_FIELD_MARGIN - document.body.getBoundingClientRect().bottom
  if (overflow > 1) main.scrollTop += overflow
}

function watchKeyboardShell() {
  if (watching) return
  const viewport = window.visualViewport
  if (!viewport) return
  watching = true

  const onResize = () => {
    applyKeyboardShell()
    window.clearTimeout(placeTimer)
    placeTimer = window.setTimeout(placeAnswerField, 80)
  }

  viewport.addEventListener("resize", onResize)
  viewport.addEventListener("scroll", applyKeyboardShell)
  onResize()

  stopWatching = () => {
    watching = false
    window.clearTimeout(placeTimer)
    viewport.removeEventListener("resize", onResize)
    viewport.removeEventListener("scroll", applyKeyboardShell)
    const body = document.body
    const snapshot = shellSnapshot
    if (snapshot) {
      body.style.position = snapshot.position
      body.style.top = snapshot.top
      body.style.left = snapshot.left
      body.style.width = snapshot.width
      body.style.height = snapshot.height
      body.style.justifyContent = snapshot.justifyContent
      if (shellMain) shellMain.style.height = snapshot.mainHeight
    }
    shellSnapshot = null
    shellMain = null
    stopWatching = null
  }
}

function releaseKeyboardShell() {
  window.clearTimeout(releaseTimer)
  releaseTimer = window.setTimeout(() => {
    activeInput = null
    stopWatching?.()
  }, 120)
}

function bindAnswerFieldViewport(input: HTMLInputElement) {
  const main = input.closest("main")
  if (!(main instanceof HTMLElement)) return

  window.clearTimeout(releaseTimer)
  activeInput = input
  shellMain = main
  watchKeyboardShell()
  window.clearTimeout(placeTimer)
  placeTimer = window.setTimeout(placeAnswerField, 80)
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
  const { className: inputClassName, onKeyDown, onFocus, onBlur, ...restInputProps } = inputProps

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

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event)
    releaseKeyboardShell()
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
        onBlur={handleBlur}
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
