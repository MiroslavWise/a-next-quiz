import { PHASE_FOOTER_CLASS } from "@/components/start/lib/phase-shell"

import AnswersCollectionProgress from "./AnswersCollectionProgress"
import LeaderNextQuestionButton from "./LeaderNextQuestionButton"

const EMPTY_ANSWERS: number[] = []
const EMPTY_USERS: number[] = []

export interface LeaderNextQuestionFooterProps {
  /** Ведущий может перейти дальше; наблюдатель видит только сбор ответов. */
  canAdvance?: boolean
  onNext: () => void
  actionBlocked: boolean
  showBusy: boolean
  isLastQuestionInQuiz: boolean
  activeIndex: number
  /** Пока вопрос в фазе GAME — счётчик ответов вместо кнопки «Следующий вопрос». */
  collectingAnswers?: boolean
  answeredCount?: number
  participantsTotal?: number
  answers: number[]
  users: number[]
}

export default function LeaderNextQuestionFooter({
  canAdvance = true,
  onNext,
  actionBlocked,
  showBusy,
  isLastQuestionInQuiz,
  activeIndex,
  collectingAnswers = false,
  answeredCount = 0,
  participantsTotal = 0,
  answers = EMPTY_ANSWERS,
  users = EMPTY_USERS,
}: LeaderNextQuestionFooterProps) {
  const showProgress = !canAdvance || collectingAnswers

  return (
    <footer className={PHASE_FOOTER_CLASS} aria-live="polite">
      {showProgress ? (
        <AnswersCollectionProgress answeredCount={answeredCount} participantsTotal={participantsTotal} answers={answers} users={users} />
      ) : (
        <LeaderNextQuestionButton
          key={activeIndex}
          onNext={onNext}
          actionBlocked={actionBlocked}
          showBusy={showBusy}
          isLastQuestionInQuiz={isLastQuestionInQuiz}
        />
      )}
    </footer>
  )
}
