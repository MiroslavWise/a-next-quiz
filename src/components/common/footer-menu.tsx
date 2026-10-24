import Link from "next/link"
import type { Route } from "next"
import { BrainIcon, ClipboardListIcon, ListChecksIcon, UsersIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import styles from "./footer-menu.module.scss"

function FooterMenu() {
  return (
    <footer className="game-liquid fixed right-5 bottom-5 left-5 rounded-xl border-2 border-black/80 px-4 py-2.5 shadow-[6px_6px_0_0_#0a0c0b]">
      <nav className="grid w-full grid-cols-4 items-center justify-center gap-3 sm:gap-6">
        {LINKS_FOOTER_MENU.map(({ href, icon: Icon, label, textClass }) => (
          <Link
            key={href + "::" + "menu"}
            href={href}
            className={cn("flex w-full flex-col items-center justify-center px-2", textClass, styles.menuLink)}
          >
            <span
              className={cn(
                styles.menuIcon,
                "mb-0.5 size-9 rounded-md border-2 border-black/70 bg-black/35 shadow-[2px_2px_0_0_#0a0c0b]",
              )}
              aria-hidden
            >
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-bold transition-colors duration-500">{label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  )
}

FooterMenu.displayName = "FooterMenu"
export default FooterMenu

const LINKS_FOOTER_MENU: {
  label: string
  icon: typeof ListChecksIcon
  href: Route
  textClass: string
}[] = [
  {
    label: "Отчёты",
    icon: ListChecksIcon,
    href: "/admin/reports",
    textClass: "text-(--orb-border-one)",
  },
  {
    label: "Квизы",
    icon: ClipboardListIcon,
    href: "/admin",
    textClass: "text-(--orb-border-two)",
  },
  {
    label: "Админы",
    icon: UsersIcon,
    href: "/admin/staff",
    textClass: "text-(--orb-border-three)",
  },
  {
    label: "Механика",
    icon: BrainIcon,
    href: "/game-mechanics",
    textClass: "text-(--orb-border-four)",
  },
]
