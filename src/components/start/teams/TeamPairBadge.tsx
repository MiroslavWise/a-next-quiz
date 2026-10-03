import { cn } from "@/lib/utils"

export function TeamPairBadge({ color, onClick }: { color: string; onClick?: () => void }) {
  const className =
    "inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[0.6rem] leading-none font-semibold tracking-wide text-white/90"
  const style = { borderColor: color }
  const mark = (
    <>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      пара
    </>
  )
  if (!onClick) {
    return (
      <span className={className} style={style}>
        {mark}
      </span>
    )
  }
  return (
    <button
      type="button"
      className={cn(className, "cursor-pointer")}
      style={style}
      aria-label="Бонусы пары"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      {mark}
    </button>
  )
}
