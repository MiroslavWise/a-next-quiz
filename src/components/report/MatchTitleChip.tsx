import { cn } from "@/lib/utils"
import type { IMatchTitle } from "@/api/reports"

function MatchTitleChip({ title, className }: { title: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-amber-500/45 bg-amber-950/35 px-2.5 py-1 text-[0.7rem] leading-none font-semibold tracking-wide text-amber-200 shadow-[0_0_16px_rgba(196,181,253,0.28)]",
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-[#c4b5fd] shadow-[0_0_6px_#c4b5fd]" aria-hidden />
      <span className="min-w-0 truncate">{title}</span>
    </span>
  )
}

export function MatchTitleChips({
  titles,
  className,
  align = "start",
}: {
  titles?: IMatchTitle[] | null
  className?: string
  align?: "start" | "center"
}) {
  const list = (titles ?? []).filter((item) => item?.title?.trim())
  if (list.length === 0) return null

  return (
    <ul
      className={cn("flex flex-wrap gap-1.5", align === "center" && "justify-center", className)}
      aria-label="Звания"
    >
      {list.map((item) => (
        <li key={item.id || item.title} className="max-w-full min-w-0">
          <MatchTitleChip title={item.title} />
        </li>
      ))}
    </ul>
  )
}
