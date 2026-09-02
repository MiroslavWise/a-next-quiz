import Skeleton from "@/components/ui/skeleton"

const array = Array.from({ length: 7 })

export function LeaderNextQuestionFooterSkeleton() {
  return (
    <footer
      className="bottom-next fixed right-0 bottom-0 left-0 z-50 flex shrink-0 flex-row py-2"
      aria-hidden
    >
      <div className="flex flex-row items-center px-4 py-1">
        {array.map((_, index) => (
          <Skeleton
            key={"::" + index + "skeleton"}
            className="relative h-7 w-full rounded-full bg-white/10"
            style={{
              marginLeft: index === 0 ? 0 : -10,
              zIndex: array.length - index,
            }}
          />
        ))}
      </div>
    </footer>
  )
}

export function ActiveChartsSkeleton() {
  return (
    <div className="glass-start-liquid-palette w-full rounded-xl border border-(--accent-orb)/40 p-4 sm:p-5 xl:rounded-xl xl:p-6">
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6 xl:mt-5 xl:gap-8">
        <div className="relative">
          <Skeleton className="size-28 rounded-full border border-(--accent-orb)/40 lg:size-36 2xl:size-66" />
          <div className="absolute inset-3 rounded-full bg-black/50 xl:inset-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-3 w-5 rounded-md bg-white/16 xl:h-4 xl:w-7" />
          </div>
        </div>
        <div className="w-full space-y-2 xl:space-y-2.5">
          <Skeleton className="h-10 w-full rounded-lg border border-white/12 bg-white/10 xl:h-11 xl:rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg border border-white/12 bg-white/10 xl:h-11 xl:rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg border border-white/12 bg-white/10 xl:h-11 xl:rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function WithRankSkeleton() {
  return (
    <div className="glass-start-liquid-palette flex min-h-46 w-full flex-col items-center justify-center gap-4 rounded-xl border border-white/10 px-4 py-5 text-center sm:min-h-52 sm:px-5 xl:min-h-58 xl:rounded-2xl xl:px-6">
      <Skeleton className="size-16 rounded-full bg-white/12 sm:size-18 xl:size-20" />
      <div className="flex w-full max-w-sm flex-col items-center gap-2">
        <Skeleton className="h-5 w-40 rounded-md bg-white/12" />
        <Skeleton className="h-4 w-28 rounded-md bg-white/10" />
      </div>
    </div>
  )
}

export function DefaultActiveSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-2 px-4">
      <div className="flex flex-row items-center gap-2">
        <Skeleton className="h-10 w-30 rounded-xl border border-white/10 bg-white/10 sm:h-11 sm:w-34" />
      </div>
      <div className="flex min-h-60 w-full items-center justify-center">
        <Skeleton className="h-full min-h-30 w-full max-w-2xl rounded-xl border border-white/10 bg-white/10 sm:min-h-34" />
      </div>
      <ul className="flex w-full flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="w-full">
            <Skeleton className="h-13 w-full rounded-xl border border-white/10 bg-white/10 sm:h-14" />
          </li>
        ))}
      </ul>
    </div>
  )
}
