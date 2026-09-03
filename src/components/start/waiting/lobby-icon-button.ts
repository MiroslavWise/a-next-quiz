import { cn } from "@/lib/utils"

export const LOBBY_ICON_BUTTON_CLASS = cn(
  "inline-flex aspect-square shrink-0 items-center justify-center rounded-lg border border-(--accent-orb)/30 bg-(--accent-orb)/10 px-2 py-1.5",
  "text-white/90",
  "transition-colors hover:border-(--accent-orb)/50 hover:bg-(--accent-orb)/16",
  "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--accent-orb)/50",
)

export const LOBBY_ICON_BUTTON_ICON_CLASS = "size-3.5 shrink-0 text-white/55"
