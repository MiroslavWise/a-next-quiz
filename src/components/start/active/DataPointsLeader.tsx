"use client"

import { XIcon } from "lucide-react"
import { type Dispatch, type SetStateAction, useMemo } from "react"

import UserPointsLeaderItem from "./UserPointsLeaderItem"

import { cn } from "@/lib/utils"
import { useFlipList } from "@/hooks/use-flip-list"
import type { LastSocketEventByType } from "@/hooks/socket-event-by-type"
import type { QuizEvent } from "@/hooks/useQuizSocketIO"
import { normalizeTelegramId } from "@/lib/normalize"
import { reportUserTotalPoints } from "@/api/reports"
import { useAnswerOrderBy } from "../hooks/use-answer-order-by"
import { useReportUserPoints } from "../hooks/use-report-user-points"
import { statusesByIndexForUser, useUsersAnswersStatus } from "../hooks/use-users-answers-status"

import styles from "../styles/optimal.module.scss"

interface IProps {
  tgId: number
  lastByType: LastSocketEventByType<QuizEvent>
  reportId: string | number
  showDataPointsLeader: boolean
  prizes: number[]
  setVisibleDataPointsLeader: Dispatch<SetStateAction<boolean>>
  /** Порядок ответов на текущий вопрос (ключи `count-answers.users` в порядке появления). */
  answeredUserIds?: number[]
  showAnswerOrder?: boolean
  activeIndex: number
  /** Индекс вопроса из `count-answers.index` (должен совпадать с `activeIndex`). */
  answerProgressIndex?: number
  isQuestionEnded?: boolean
  elementAvatarId?: number | null
  totalQuestions?: number
}

/** Длительность FLIP-анимации при смене мест в таблице. */
const LEADERBOARD_REORDER_MS = 1_200

function DataPointsLeader({
  reportId,
  tgId,
  showDataPointsLeader,
  setVisibleDataPointsLeader,
  lastByType,
  prizes,
  answeredUserIds,
  showAnswerOrder = false,
  activeIndex,
  answerProgressIndex,
  isQuestionEnded,
  elementAvatarId,
  totalQuestions = 0,
}: IProps) {
  const { sortedData, isBackgroundRefreshing } = useReportUserPoints({
    reportId,
    tgId,
    lastByType,
    keepPrevious: true,
  })

  const { matrix } = useUsersAnswersStatus({ reportId, tgId, lastByType })

  const answerStatusByTelegramId = useMemo(() => {
    const map = new Map<number, ReturnType<typeof statusesByIndexForUser>>()
    for (const item of sortedData) {
      const tgKey = normalizeTelegramId(item.telegram_id)
      if (!Number.isFinite(tgKey)) continue
      map.set(tgKey, statusesByIndexForUser(matrix, item.telegram_id))
    }
    return map
  }, [matrix, sortedData])

  const answerOrderByTelegramId = useAnswerOrderBy(showAnswerOrder && answerProgressIndex === activeIndex ? (answeredUserIds ?? []) : [])
  const leaderboardListRef = useFlipList(sortedData, LEADERBOARD_REORDER_MS)

  function handleClose() {
    setVisibleDataPointsLeader(false)
  }

  return (
    <div
      className={cn(
        "bg-background/60 flex flex-col overflow-hidden border border-white/12 shadow-2xl ring-1 shadow-black/50 ring-white/5 backdrop-blur-xl transition-[opacity,visibility] duration-300 ease-out",
        // телефон: плавающий оверлей
        "top-button-fixed fixed right-4 z-115 max-h-[50vh] w-full max-w-72 rounded-xl",
        showDataPointsLeader ? "pointer-events-auto visible opacity-100" : "pointer-events-none invisible opacity-0",
        // планшет+: колонка 1/3, всегда видна
        "md:pointer-events-auto md:visible md:static md:top-auto md:right-auto md:z-10 md:mr-4 md:h-full md:max-h-none md:min-h-0 md:w-1/3 md:max-w-none md:shrink-0 md:self-stretch md:border-0 md:bg-transparent md:pt-12 md:pb-4 md:opacity-100 md:shadow-none md:ring-0",
      )}
      role="presentation"
    >
      <section
        className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 md:rounded-xl md:border md:border-white/12 md:bg-background/60 md:p-3 md:shadow-2xl md:ring-1 md:shadow-black/50 md:ring-white/5 md:backdrop-blur-xl"
        role="region"
        aria-labelledby="data-points-leader-title"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 flex-row items-center justify-between py-1.5">
          <h3
            id="data-points-leader-title"
            className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-white lg:text-base"
          >
            <span className="truncate">Таблица лидеров</span>
            {isBackgroundRefreshing && (
              <span
                className="inline-flex size-1.5 shrink-0 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]"
                aria-label="Обновляем таблицу лидеров"
                title="Обновляем таблицу лидеров"
              />
            )}
          </h3>
          <div
            className={cn("flex w-fit flex-row items-center gap-1 md:hidden", styles.buttonsPointsLeader)}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={handleClose} aria-label="Закрыть таблицу лидеров">
              <XIcon aria-hidden />
            </button>
          </div>
        </header>
        <ul
          ref={leaderboardListRef}
          className="mt-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain pt-1.5 pr-1 [-webkit-overflow-scrolling:touch]"
        >
          {sortedData.map((item, index) => {
            const rank = index + 1
            const isPrizePlace = prizes.includes(rank)
            const tgKey = normalizeTelegramId(item.telegram_id)
            const answerOrder = Number.isFinite(tgKey) ? answerOrderByTelegramId.get(tgKey) : undefined
            const answerStatusByIndex = Number.isFinite(tgKey) ? answerStatusByTelegramId.get(tgKey) : undefined
            return (
              <UserPointsLeaderItem
                key={item.telegram_id}
                telegram_id={item.telegram_id}
                tgId={tgId}
                points={reportUserTotalPoints(item)}
                rank={rank}
                rank_delta={item.rank_delta}
                points_delta={item.points_delta}
                isPrizePlace={isPrizePlace}
                answerOrder={answerOrder}
                isQuestionEnded={isQuestionEnded}
                elementAvatarId={elementAvatarId}
                totalQuestions={totalQuestions}
                activeIndex={activeIndex}
                answerStatusByIndex={answerStatusByIndex}
              />
            )
          })}
          {!sortedData.length ? (
            <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65">Нет участников</li>
          ) : null}
        </ul>
      </section>
    </div>
  )
}

DataPointsLeader.displayName = "DataPointsLeader"
export default DataPointsLeader
