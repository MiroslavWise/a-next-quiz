"use client"

import { cn } from "@/lib/utils"
import { EReportMyPassedQuestionsResult, type IReportMyPassedQuestions } from "@/api/reports"
import { useElementThemeSession } from "@/stores/element-theme-session"

const RESULT_DOT_CLASS: Record<EReportMyPassedQuestionsResult, string> = {
  [EReportMyPassedQuestionsResult.CORRECT]: "bg-(--faithful) shadow-[0_0_8px_color-mix(in_srgb,var(--faithful)_70%,transparent)]",
  [EReportMyPassedQuestionsResult.WRONG]: "bg-(--unfaithful) shadow-[0_0_8px_color-mix(in_srgb,var(--unfaithful)_70%,transparent)]",
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
    <div className="flex w-full flex-col items-center gap-1.5" aria-label={`Вопрос ${currentQuestion} из ${safeTotalQuestions}`}>
      <span className="relative flex flex-wrap items-center justify-center gap-1.5" aria-hidden>
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
                "size-2 rounded-full transition-colors",
                isCurrent && (resultClass ?? (isGameAvatar ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.55)]" : "bg-(--accent-orb) shadow-[0_0_8px_color-mix(in_srgb,var(--accent-orb)_80%,transparent)]")),
                !isCurrent && isPassed && (resultClass ?? "bg-(--accent-orb)/80"),
                !isCurrent && !isPassed && "bg-white/18",
              )}
            />
          )
        })}
      </span>
      <span className="font-mono text-[0.65rem] leading-none font-semibold text-white/55 tabular-nums">
        {currentQuestion}/{safeTotalQuestions}
      </span>
    </div>
  )
}

DotsQuestions.displayName = "DotsQuestions"
export default DotsQuestions
