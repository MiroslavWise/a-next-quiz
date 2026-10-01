import { type PropsWithChildren } from "react"

/**
 * Оболочка /start: полноэкранный scroll.
 * Верхний спейсер в потоке прокрутки — отступ под кнопки Mini App на старте.
 */
export default function StartLayout({ children }: PropsWithChildren) {
  return (
    <main className="start-shell">
      <div className="start-shell-top" aria-hidden />
      <section className="start-shell-inner">{children}</section>
    </main>
  )
}
