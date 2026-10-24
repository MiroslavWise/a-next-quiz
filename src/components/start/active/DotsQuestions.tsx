"use client"

import { cn } from "@/lib/utils"
import { EReportMyPassedQuestionsResult, type IReportMyPassedQuestions } from "@/api/reports"
import { useElementThemeSession } from "@/stores/element-theme-session"

const RESULT_DOT_CLASS: Record<EReportMyPassedQuestionsResult, string> = {
  [EReportMyPassedQuestionsResult.CORRECT]: "bg-(--faithful) outline outline-2 outline-black/80",
  [EReportMyPassedQuestionsResult.WRONG]: "bg-(--unfaithful) outline outline-2 outline-black/80",
  [EReportMyPassedQuestionsResult.SKIPPED]: "bg-slate-400 outline outline-2 outline-black/50",
}

export interface IDotsQuestionsProps {
  activeIndex: number
  totalQuestions: number
  myPassedQuestions?: IReportMyPassedQuestions
  /**
   * Подсвечивать кружки персональным результатом (верно/неверно/пропуск; пропуск после END = ошибка по очкам).
   * Только для участника игры. Для лидера/наблюдателя — `false`: у них нет
   * персональных ответов (`my-passed-questions` им недоступен), показываем нейтральный прогресс.
   */
  showResults?: boolean
  /**
   * Плашка по центру верхнего бордера карточки вопроса: половина над линией, половина под ней.
   */
  anchored?: boolean
}

function DotsQuestions({ activeIndex, totalQuestions, myPassedQuestions, showResults = true, anchored = false }: IDotsQuestionsProps) {
  const isGameAvatar = useElementThemeSession((s) => s.isGameAvatar)
  const safeTotalQuestions = Math.max(0, totalQuestions)
  const currentQuestion = Math.min(Math.max(activeIndex, 1), safeTotalQuestions)

  if (!safeTotalQuestions) return null

  const passed = showResults ? (myPassedQuestions?.passed ?? []) : []
  const resultByIndex = new Map(passed.map((item) => [item.index, item.result]))

  const dots = Array.from({ length: safeTotalQuestions }).map((_, index) => {
    const questionNumber = index + 1
    const isCurrent = questionNumber === currentQuestion
    const isPassed = questionNumber < currentQuestion
    const passedResult = resultByIndex.get(index)
    const resultClass = passedResult ? RESULT_DOT_CLASS[passedResult] : undefined
    const currentFallback =
      anchored || isGameAvatar
        ? "bg-white outline outline-2 outline-black/80"
        : "bg-(--accent-orb) outline outline-2 outline-black/80"

    return (
      <span
        key={questionNumber + "dots-questions-item"}
        className={cn(
          "size-2 shrink-0 rounded-full transition-colors",
          isCurrent && (resultClass ?? currentFallback),
          !isCurrent && isPassed && (resultClass ?? (anchored ? "bg-white/70" : "bg-(--accent-orb)/80")),
          !isCurrent && !isPassed && (anchored ? "bg-white/25" : "bg-white/18"),
        )}
      />
    )
  })

  const counter = (
    <span
      className={cn(
        "font-mono leading-none font-semibold tabular-nums",
        "shrink-0",
        anchored ? "text-[0.625rem] text-white/85" : "text-[0.65rem] text-white/55",
      )}
    >
      {currentQuestion}/{safeTotalQuestions}
    </span>
  )

  if (anchored) {
    return (
      <div
        className="absolute top-0 left-1/2 z-20 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-background p-0.5 shadow-[3px_3px_0_0_#0a0c0b]"
        aria-label={`Вопрос ${currentQuestion} из ${safeTotalQuestions}`}
      >
        <div
          className={cn(
            "flex max-w-full flex-row flex-nowrap items-center justify-center gap-1.5 rounded-md border-2 border-black/80 px-2 py-1",
            isGameAvatar ? "bg-white/20" : "bg-(--accent-orb)/90",
          )}
        >
          <span className="relative flex min-w-0 flex-row flex-nowrap items-center justify-center gap-1 overflow-x-auto" aria-hidden>
            {dots}
          </span>
          {counter}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-row flex-nowrap items-center justify-center gap-1.5" aria-label={`Вопрос ${currentQuestion} из ${safeTotalQuestions}`}>
      <span className="relative flex min-w-0 flex-row flex-nowrap items-center justify-center gap-1.5 overflow-x-auto" aria-hidden>
        {dots}
      </span>
      {counter}
    </div>
  )
}

DotsQuestions.displayName = "DotsQuestions"
export default DotsQuestions
