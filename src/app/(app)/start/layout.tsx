import { type PropsWithChildren } from "react"

/**
 * Оболочка /start: один scroll-container на весь экран
 * (как admin / game-mechanics). Внутренние фазы могут
 * дополнительно скроллить свои колонки (GAME / staff).
 */
export default function StartLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative flex h-full min-h-0 w-full flex-col items-center overflow-y-auto overscroll-contain px-0 text-white lg:px-4">
      <section className="relative z-10 mx-auto flex h-full min-h-0 w-full flex-1 flex-col">{children}</section>
    </main>
  )
}
