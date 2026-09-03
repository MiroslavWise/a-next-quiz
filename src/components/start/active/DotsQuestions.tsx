"use client"

import { cn } from "@/lib/utils"
import { EReportMyPassedQuestionsResult, type IReportMyPassedQuestions } from "@/api/reports"
import { useElementThemeSession } from "@/stores/element-theme-session"

const RESULT_DOT_CLASS: Record<EReportMyPassedQuestionsResult, string> = {
  [EReportMyPassedQuestionsResult.CORRECT]: "bg-(--faithful)",
  [EReportMyPassedQuestionsResult.WRONG]: "bg-(--unfaithful)",
  [EReportMyPassedQuestionsResult.SKIPPED]: "bg-slate-400",
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
}

function DotsQuestions({ activeIndex, totalQuestions, myPassedQuestions, showResults = true }: IDotsQuestionsProps) {
  const isGameAvatar = useElementThemeSession((s) => s.isGameAvatar)
  const safeTotalQuestions = Math.max(0, totalQuestions)
  const currentQuestion = Math.min(Math.max(activeIndex, 1), safeTotalQuestions)

  if (!safeTotalQuestions) return null

  const passed = showResults ? (myPassedQuestions?.passed ?? []) : []
  const resultByIndex = new Map(passed.map((item) => [item.index, item.result]))

  return (
    <div
      className="bg-background/95 absolute top-0 left-4 isolate z-10 flex max-w-[calc(100%-2rem)] -translate-y-1/2 items-center justify-center rounded-full p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_20px_rgba(0,0,0,0.24)]"
      aria-label={`Вопрос ${currentQuestion} из ${safeTotalQuestions}`}
    >
      <div
        className={cn(
          "flex max-w-full flex-row items-center gap-1.5 rounded-full border px-2 py-1 shadow-lg shadow-black/20 backdrop-blur-md",
          isGameAvatar ? "border-white/30 bg-white/18" : "border-white/15 bg-(--accent-orb)/90",
        )}
      >
        <span className="font-mono text-[0.625rem] leading-none font-semibold text-white/85 tabular-nums">
          {currentQuestion}/{safeTotalQuestions}
        </span>
        <span className="relative flex min-w-0 flex-row items-center justify-start gap-1" aria-hidden>
          {Array.from({ length: safeTotalQuestions }).map((_, index) => {
            const questionNumber = index + 1
            const isCurrent = questionNumber === currentQuestion
            const isPassed = questionNumber < currentQuestion
            const passedResult = resultByIndex.get(index)
            const resultClass = passedResult ? RESULT_DOT_CLASS[passedResult] : undefined

            return (
              <span
                key={questionNumber + "dots-questions-item"}
                className={cn(
                  "h-2 shrink-0 rounded-full",
                  isCurrent ? "w-5" : "w-2",
                  isCurrent && (resultClass ?? "bg-white"),
                  !isCurrent && isPassed && (resultClass ?? "bg-white/70"),
                  !isCurrent && !isPassed && "bg-white/25",
                )}
              />
            )
          })}
        </span>
      </div>
    </div>
  )
}

DotsQuestions.displayName = "DotsQuestions"
export default DotsQuestions
