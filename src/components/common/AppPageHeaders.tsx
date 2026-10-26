import Link from "next/link"
import type { Route } from "next"
import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

import Button from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AppPageHeaderAccent = "one" | "two" | "three" | "four"

export interface AppPageHeadersProps {
  title: string
  description: string
  toolbarTitle: string
  /** Сохранён для совместимости вызовов; визуально страница на --accent-orb. */
  accent?: AppPageHeaderAccent
  backTo?: Route
  backAriaLabel?: string
  toolbarAction?: ReactNode
  toolbarClassName?: string
}

function AppPageHeaders({
  title,
  description,
  toolbarTitle,
  backTo = "/",
  backAriaLabel = "Назад",
  toolbarAction,
  toolbarClassName,
}: AppPageHeadersProps) {
  return (
    <>
      <header className="game-liquid rounded-lg px-4 py-4 sm:px-5">
        <p className="mb-1 text-left text-[0.65rem] font-bold tracking-[0.18em] text-(--accent-orb) uppercase">{toolbarTitle}</p>
        <h1 className="text-xl leading-tight font-bold tracking-tight text-balance text-white sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-white/65">{description}</p>
      </header>

      <header className={cn("game-slab mt-3 flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5", toolbarClassName)}>
        <div className={cn("grid w-full items-center gap-3", toolbarAction ? "grid-cols-[auto_minmax(0,1fr)_auto]" : "grid-cols-[auto_minmax(0,1fr)]")}>
          <Button
            asChild
            variant="outline"
            size="icon"
            aria-label={backAriaLabel}
            className="size-9 rounded-lg border-2 border-black/80 bg-black/35 text-white shadow-[3px_3px_0_0_#0a0c0b] hover:bg-black/45"
          >
            <Link href={backTo} aria-label={backAriaLabel} scroll>
              <ArrowLeft className="size-3.5" aria-hidden />
            </Link>
          </Button>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate text-sm font-bold tracking-tight text-white sm:text-base">{toolbarTitle}</h2>
          </div>
          {toolbarAction ? <div className="shrink-0 [&_button]:rounded-lg [&_button]:border-2 [&_button]:border-black/80 [&_button]:shadow-[3px_3px_0_0_#0a0c0b]">{toolbarAction}</div> : null}
        </div>
      </header>
    </>
  )
}

AppPageHeaders.displayName = "AppPageHeaders"
export default AppPageHeaders
