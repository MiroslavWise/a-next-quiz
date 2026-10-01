import { type PropsWithChildren } from "react"

/**
 * Оболочка /start: полноэкранный scroll-container.
 * Верхний отступ — кнопки Telegram Mini App и safe-area;
 * внутренние фазы могут дополнительно скроллить свои колонки (GAME / staff).
 */
export default function StartLayout({ children }: PropsWithChildren) {
  return (
    <main className="start-shell">
      <section className="start-shell-inner">{children}</section>
    </main>
  )
}
