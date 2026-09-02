import { cn } from "@/lib/utils"
import { EUsersAnswerStatus, type TUsersAnswerStatusFromApi } from "@/api/reports"

const STATUS_DOT_CLASS: Record<EUsersAnswerStatus, string> = {
  [EUsersAnswerStatus.CORRECT]: "bg-(--faithful)",
  [EUsersAnswerStatus.WRONG]: "bg-(--unfaithful)",
  [EUsersAnswerStatus.SKIPPED]: "bg-slate-400",
  [EUsersAnswerStatus.WAITING]: "bg-white/25",
}

const STATUS_LABEL: Record<EUsersAnswerStatus, string> = {
  [EUsersAnswerStatus.CORRECT]: "Верно",
  [EUsersAnswerStatus.WRONG]: "Неверно",
  [EUsersAnswerStatus.SKIPPED]: "Пропуск",
  [EUsersAnswerStatus.WAITING]: "Ожидание",
}

export interface IUserAnswerStatusDotsProps {
  totalQuestions: number
  /** Статусы с бэкенда по индексу вопроса; отсутствующий индекс = waiting. */
  statusByIndex?: Map<number, TUsersAnswerStatusFromApi>
  /** 0-based индекс активного вопроса. */
  activeIndex?: number
  /** Активный вопрос закрыт (`END`) — без мигания. */
  isQuestionEnded?: boolean
}

function resolveStatus(
  index: number,
  statusByIndex: Map<number, TUsersAnswerStatusFromApi> | undefined,
): EUsersAnswerStatus {
  const fromApi = statusByIndex?.get(index)
  if (fromApi) return fromApi
  return EUsersAnswerStatus.WAITING
}

function UserAnswerStatusDots({
  totalQuestions,
  statusByIndex,
  activeIndex,
  isQuestionEnded = false,
}: IUserAnswerStatusDotsProps) {
  const safeTotal = Math.max(0, totalQuestions)
  if (!safeTotal) return null

  return (
    <div
      className="flex max-w-full flex-row items-center gap-0.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
      aria-label="Статусы ответов по вопросам"
    >
      {Array.from({ length: safeTotal }).map((_, index) => {
        const status = resolveStatus(index, statusByIndex)
        const pulseActive = activeIndex === index && !isQuestionEnded
        const label = `Вопрос ${index + 1}: ${STATUS_LABEL[status]}`

        return (
          <span
            key={`user-answer-status-${index}`}
            role="listitem"
            title={label}
            aria-label={label}
            className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_CLASS[status], pulseActive && "animate-pulse")}
          />
        )
      })}
    </div>
  )
}

UserAnswerStatusDots.displayName = "UserAnswerStatusDots"
export default UserAnswerStatusDots
