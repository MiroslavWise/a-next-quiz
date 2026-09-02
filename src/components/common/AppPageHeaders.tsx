import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

import Button from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AppPageHeaderAccent = "one" | "two" | "three" | "four"

const ACCENT_CLASS: Record<
  AppPageHeaderAccent,
  { heroTitle: string; heroDescription: string; toolbarTitle: string; backButton: string }
> = {
  one: {
    heroTitle: "text-(--orb-border-one)",
    heroDescription: "text-(--orb-bg-one)",
    toolbarTitle: "text-(--orb-border-one)",
    backButton: "border-(--orb-border-one) text-(--orb-bg-one)",
  },
  two: {
    heroTitle: "text-(--orb-border-two)",
    heroDescription: "text-(--orb-bg-two)",
    toolbarTitle: "text-(--orb-border-two)",
    backButton: "border-(--orb-border-two) text-(--orb-bg-two)",
  },
  three: {
    heroTitle: "text-(--orb-border-three)",
    heroDescription: "text-(--orb-bg-three)",
    toolbarTitle: "text-(--orb-border-three)",
    backButton: "border-(--orb-border-three) text-(--orb-bg-three)",
  },
  four: {
    heroTitle: "text-(--orb-border-four)",
    heroDescription: "text-(--orb-bg-four)",
    toolbarTitle: "text-(--orb-border-four)",
    backButton: "border-(--orb-border-four) text-(--orb-bg-four)",
  },
}

export interface AppPageHeadersProps {
  title: string
  description: string
  toolbarTitle: string
  accent?: AppPageHeaderAccent
  backTo?: string
  backAriaLabel?: string
  toolbarAction?: ReactNode
  toolbarClassName?: string
}

function AppPageHeaders({
  title,
  description,
  toolbarTitle,
  accent = "two",
  backTo = "/",
  backAriaLabel = "Назад",
  toolbarAction,
  toolbarClassName,
}: AppPageHeadersProps) {
  const styles = ACCENT_CLASS[accent]

  return (
    <>
      <header className="flex items-center justify-between gap-4 py-4">
        <div>
          <h1 className={cn("font-sans text-xl leading-tight font-semibold tracking-tight sm:text-2xl", styles.heroTitle)}>
            {title}
          </h1>
          <p className={cn("text-sm", styles.heroDescription)}>{description}</p>
        </div>
      </header>

      <header
        className={cn(
          "border-border -mx-4 flex w-[calc(100%+2rem)] items-center justify-between gap-4 border-y p-4 bg-background",
          toolbarClassName,
        )}
      >
        <div
          className={cn(
            "grid w-full gap-3",
            toolbarAction ? "grid-cols-[auto_minmax(0,1fr)_auto]" : "grid-cols-[auto_minmax(0,1fr)]",
          )}
        >
          <Button asChild variant="outline" size="icon" aria-label={backAriaLabel} className={styles.backButton}>
            <Link href={backTo}>
              <ArrowLeft className="size-3.5" />
            </Link>
          </Button>
          <div className="flex flex-col gap-2">
            <h2 className={cn("text-lg font-semibold tracking-tight", styles.toolbarTitle)}>{toolbarTitle}</h2>
          </div>
          {toolbarAction}
        </div>
      </header>
    </>
  )
}

AppPageHeaders.displayName = "AppPageHeaders"
export default AppPageHeaders
