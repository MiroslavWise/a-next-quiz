import Link from "next/link"
import { ChevronRightIcon, Gamepad2 } from "lucide-react"

import Button from "@/components/ui/button"
import { cn } from "@/lib/utils"

import styles from "@/components/styles/button-to.module.scss"

function ButtonToGames() {
  return (
    <Button
      asChild
      variant="outline"
      className={cn("h-auto justify-between overflow-hidden rounded-2xl px-4 py-3 text-left", styles.button, styles.toneThree)}
    >
      <Link href="/games">
        <span className="flex min-w-0 items-center gap-3">
          <span className={cn("bg-background/60 flex size-9 shrink-0 items-center justify-center rounded-xl border", styles.buttonIcon)}>
            <Gamepad2 className="size-4 text-current" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-current">Мои игры</span>
            <span className="text-muted-foreground mt-0.5 block truncate text-xs">Последние завершённые матчи и ваши результаты</span>
          </span>
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-current" aria-hidden />
      </Link>
    </Button>
  )
}

ButtonToGames.displayName = "ButtonToGames"
export default ButtonToGames
