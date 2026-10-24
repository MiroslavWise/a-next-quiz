import { cn } from "@/lib/utils"

export const LOBBY_ICON_BUTTON_CLASS = cn(
  "inline-flex aspect-square shrink-0 items-center justify-center rounded-md border-2 border-black/70 bg-(--accent-orb)/15 px-2 py-1.5 shadow-[2px_2px_0_0_#0a0c0b]",
  "text-white/90",
  "transition-[transform,box-shadow] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0_0_#0a0c0b]",
  "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--accent-orb)/70",
)

export const LOBBY_ICON_BUTTON_ICON_CLASS = "size-3.5 shrink-0 text-white/55"
