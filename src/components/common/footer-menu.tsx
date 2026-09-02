import Link from "next/link"
import { BrainIcon, ClipboardListIcon, ListChecksIcon, UsersIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import styles from "./footer-menu.module.scss"

function FooterMenu() {
  return (
    <footer className="glass-effect fixed right-5 bottom-5 left-5 rounded-lg px-4 py-2 backdrop-blur-sm">
      <nav className="grid w-full grid-cols-4 items-center justify-center gap-3 sm:gap-6">
        {LINKS_FOOTER_MENU.map(({ href, icon: Icon, label, textClass }) => (
          <Link
            key={href + "::" + "menu"}
            href={href}
            className={cn("flex w-full flex-col items-center justify-center px-2", textClass, styles.menuLink)}
          >
            <span className={styles.menuIcon} aria-hidden>
              <Icon className="size-5" />
            </span>
            <span className="text-sm font-medium transition-colors duration-500">{label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  )
}

FooterMenu.displayName = "FooterMenu"
export default FooterMenu

const LINKS_FOOTER_MENU = [
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
