import GetCount from "./ItemGetCount"
import { AnswerersAvatarStack } from "./AnswerersAvatarStack"

import { cn } from "@/lib/utils"
import type { IAnswerUserEntry } from "@/api/reports"

interface IProps {
  id: string
  answerOptionGlassBase: string
  results: boolean
  endTintClass: string
  description: string
  getCount(answerId: string): number
  /** Живой tally в GAME (`count-answers`); `null` — не показывать. */
  liveCount?: number | null
  participantsTotal?: number
  /** Кто выбрал этот вариант (только лидер/обсервер, фаза results). */
  answerers?: IAnswerUserEntry[]
  viewerTgId?: number
  isCorrectAnswer?: boolean
  stackExpanded?: boolean
  onStackExpandedChange?: (open: boolean) => void
}

function ItemSubAnswer({
  id,
  answerOptionGlassBase,
  results,
  endTintClass,
  getCount,
  description,
  liveCount = null,
  participantsTotal = 0,
  answerers,
  viewerTgId,
  isCorrectAnswer,
  stackExpanded,
  onStackExpandedChange,
}: IProps) {
  const showLiveTally = liveCount != null
  const showCountBar = results || showLiveTally
  const showStack = results && !!answerers?.length && !!viewerTgId

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div
        className={cn(
          "relative overflow-hidden select-none",
          showLiveTally && "flex items-center gap-3",
          answerOptionGlassBase,
          results ? endTintClass : null,
        )}
      >
        {showCountBar && <GetCount fraction={getCount(id)} />}
        <span className="relative z-1 min-w-0 flex-1">{description}</span>
        {showLiveTally ? (
          <span
            className="relative z-1 inline-flex min-w-6 shrink-0 items-center justify-center rounded-md bg-black/40 px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums"
            title={`Ответов: ${liveCount} из ${participantsTotal}`}
            aria-label={`Ответов: ${liveCount} из ${participantsTotal}`}
          >
            {liveCount}
          </span>
        ) : null}
      </div>
      {showStack ? (
        <AnswerersAvatarStack
          users={answerers}
          viewerTgId={viewerTgId}
          tone={isCorrectAnswer ? "correct" : "wrong"}
          ariaLabel={`Выбрали этот ответ: ${answerers.length}`}
          expanded={stackExpanded}
          onExpandedChange={onStackExpandedChange}
        />
      ) : null}
    </div>
  )
}

ItemSubAnswer.displayName = "ItemSubAnswer"
export default ItemSubAnswer
