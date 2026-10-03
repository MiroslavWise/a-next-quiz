import { cn } from "@/lib/utils"

/** Колонка фазы квиза — поток в общем скролле /start. */
export const PHASE_SHELL_CLASS = cn("flex w-full flex-col gap-3 overflow-x-hidden px-4")

/** Оболочка активного вопроса: игрок — одна колонка, staff — сплит с таблицей. */
export const GAME_PLAYER_SHELL_CLASS = "flex w-full"
export const GAME_STAFF_SHELL_CLASS =
  "start-split-scroll flex w-full min-h-0 flex-1 flex-col md:flex-row md:items-stretch md:overflow-hidden"

export const GAME_PLAYER_COLUMN_CLASS = "relative flex w-full flex-col gap-3 px-4"
export const GAME_STAFF_COLUMN_CLASS =
  "relative flex w-full min-w-0 flex-col gap-3 px-4 md:h-full md:w-2/3 md:min-h-0 md:overflow-y-auto md:overscroll-contain md:pr-2"

/** Нижняя панель действия — как футер GAME. */
export const PHASE_FOOTER_CLASS = "bottom-next fixed inset-x-0 z-50 shrink-0 p-4 sm:p-5"

/** Основная кнопка в футере фазы. */
export const PHASE_FOOTER_PRIMARY_CLASS =
  "glass-start-btn-primary-palette flex h-fit min-h-15 w-full shrink-0 items-center justify-center rounded-2xl px-4 text-sm font-semibold"