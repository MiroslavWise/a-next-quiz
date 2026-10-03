export function TeamPairBadge({ color }: { color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[0.6rem] leading-none font-semibold tracking-wide text-white/90"
      style={{ borderColor: color }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      пара
    </span>
  )
}
