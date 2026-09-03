function GetCount({ fraction }: { fraction: number }) {
  const widthPct = Math.min(100, Math.max(0, fraction * 100))
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 z-0 w-0 rounded-2xl bg-amber-500/40 transition-[width] duration-300 ease-out"
      style={{ width: `${widthPct}%` }}
      aria-hidden
    />
  )
}

GetCount.displayName = "GetCount"
export default GetCount
