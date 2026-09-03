import { cn } from "@/lib/utils"

/** Колонка фазы квиза — те же отступы и скролл, что у GAME. */
export const PHASE_SHELL_CLASS = cn(
  "flex h-full min-h-0 w-full flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-4 [-webkit-overflow-scrolling:touch]",
)

/** Нижняя панель действия — как футер GAME. */
export const PHASE_FOOTER_CLASS = "bottom-next fixed inset-x-0 z-50 shrink-0 p-4 sm:p-5"

/** Основная кнопка в футере фазы. */
export const PHASE_FOOTER_PRIMARY_CLASS =
  "glass-start-btn-primary-palette flex h-fit min-h-15 w-full shrink-0 items-center justify-center rounded-2xl px-4 text-sm font-semibold"