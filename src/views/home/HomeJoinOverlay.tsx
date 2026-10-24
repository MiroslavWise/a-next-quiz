"use client"

import { cn } from "@/lib/utils"

import styles from "./home-join-overlay.module.scss"

type HomeJoinOverlayProps = {
  title?: string
  caption?: string
  status?: string
  className?: string
}

/** Полноэкранный neo-brutal сплэш при входе в игру по ссылке или коду. */
export default function HomeJoinOverlay({
  title = "Входим в игру",
  caption = "подключение",
  status = "Ищем комнату…",
  className,
}: HomeJoinOverlayProps) {
  return (
    <div
      className={cn(
        "game-dot-grid fixed inset-0 z-100 flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-4",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <header className={cn(styles.header, "flex w-full max-w-72 flex-col items-center gap-2 text-center")}>
        <p className="game-meta">{caption}</p>
        <h2 className="text-xl font-bold tracking-tight text-balance text-white sm:text-2xl">{title}</h2>
      </header>

      <section className={cn(styles.panel, "game-liquid w-full max-w-72 rounded-lg px-4 py-3.5")}>
        <p className="text-[0.65rem] font-bold tracking-[0.18em] text-white/45 uppercase">статус</p>
        <p className="mt-1 text-base font-semibold tracking-tight text-white">{status}</p>
        <div className={cn(styles.track, "mt-3")}>
          <span className={styles.fill} />
        </div>
      </section>
    </div>
  )
}
