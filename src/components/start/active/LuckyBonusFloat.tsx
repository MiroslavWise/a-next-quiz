import { Sparkles } from "lucide-react"

import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import { UserAvatarById } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { useUserByTgId } from "@/queries/user"
import type { LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"

import { useLuckyBonusBursts, type LuckyBurst } from "../hooks/use-lucky-bonus-bursts"

interface LuckyBonusFloatCardProps {
  burst: LuckyBurst
  viewerTgId: number
}

function LuckyBonusFloatCard({ burst, viewerTgId }: LuckyBonusFloatCardProps) {
  const itsMe = burst.telegramId === viewerTgId

  const { data } = useUserByTgId(burst.telegramId)

  const pseudo = data?.pseudo?.trim() || `Участник ${burst.telegramId}`

  return (
    <div
      className={cn(
        "pointer-events-none w-[min(14rem,calc(100vw-2rem))] overflow-hidden rounded-xl border px-3 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.34)] backdrop-blur-md",
        itsMe
          ? "border-amber-200/55 bg-linear-to-r from-amber-500/40 via-yellow-500/22 to-amber-400/28"
          : "border-amber-300/42 bg-linear-to-r from-amber-500/28 via-yellow-500/14 to-amber-400/20",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-1.5 flex items-center gap-1.5 leading-none text-amber-50">
        <Sparkles className="size-3.5 shrink-0 text-amber-200" aria-hidden />
        <span className="text-xs font-bold tracking-wide">{itsMe ? "Вам повезло!" : "Случайный бонус"}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <UserAvatarById
          telegramId={burst.telegramId}
          viewerTgId={viewerTgId}
          className={cn("size-8 shrink-0 rounded-full border-2", itsMe ? "border-amber-200/70" : "border-amber-300/50")}
          loadingClassName="size-8"
          pseudoFallback={(id) => `Участник ${id}`}
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">{pseudo}</p>
          <p className="mt-0.5 flex flex-row flex-nowrap items-center gap-1 text-[0.7rem] text-white/85">
            получил <span className="font-bold text-amber-200 tabular-nums">+{burst.bonus}</span>
            <PickaxeIcon className="size-3" />
          </p>
        </div>
      </div>
    </div>
  )
}

interface IProps {
  lastByType: LastSocketEventByType<QuizEvent>
  tgId: number
  activeIndex: number
  isQuestionEnded: boolean
}

function LuckyBonusFloat({ lastByType, tgId, activeIndex, isQuestionEnded }: IProps) {
  const { bursts } = useLuckyBonusBursts({ lastByType, activeIndex, isQuestionEnded })

  return (
    <div className="top-button-fixed pointer-events-none fixed left-4 z-116 flex justify-center px-4" aria-hidden={bursts.length === 0}>
      {bursts.map((item) => (
        <LuckyBonusFloatCard key={item.id} burst={item} viewerTgId={tgId} />
      ))}
    </div>
  )
}

LuckyBonusFloat.displayName = "LuckyBonusFloat"
export default LuckyBonusFloat
