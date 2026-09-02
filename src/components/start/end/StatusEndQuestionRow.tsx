import { cn } from "@/lib/utils"
import type { IReportQuestionScore } from "@/api/reports"
import { ElementEffectsList } from "@/components/elements/ElementEffectsList"
import PickaxeIcon from "@/components/lottie/PickaxeIcon"
import { isNegativeQuizPoints } from "@/lib/quiz-points"
import { reportQuestionScoreLabel, reportQuestionScoreVariant } from "@/lib/quiz-question-score"

function StatusEndQuestionRow({ q }: { q: IReportQuestionScore }) {
  const variant = reportQuestionScoreVariant(q)
  const title = q.title?.trim()

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border px-3 py-2 text-sm",
        variant === "muted" && "border-white/10 bg-white/5 text-white/45 grayscale",
        variant === "ok" && "border-emerald-400/60 bg-emerald-500/30 text-emerald-50",
        variant === "bad" && "border-rose-400/60 bg-rose-600/40 text-rose-50",
      )}
    >
      <div className="flex flex-row items-center justify-between gap-3">
        <span className="min-w-0 flex-1 overflow-hidden">
          {title ? (
            <span className="block truncate text-xs font-normal text-white/55" title={title}>
              {title}
            </span>
          ) : (
            <span className="text-xs font-medium text-white/55">Вопрос {q.index + 1}</span>
          )}
        </span>
        <span
          className={cn(
            "shrink-0 font-mono text-xs font-semibold whitespace-nowrap tabular-nums",
            q.points != null && isNegativeQuizPoints(q.points) && "text-rose-200",
          )}
        >
          <span className="inline-grid grid-cols-[minmax(0,1fr)_0.75rem] items-center gap-1">
            <span>{reportQuestionScoreLabel(q)}</span>
            {q.points != null ? <PickaxeIcon points={q.points} className="size-3 shrink-0" /> : null}
          </span>
        </span>
      </div>
      <ElementEffectsList effects={q.element_effects} variant="strip" className="border-t border-white/10 pt-1.5" />
    </div>
  )
}

StatusEndQuestionRow.displayName = "StatusEndQuestionRow"
export default StatusEndQuestionRow
