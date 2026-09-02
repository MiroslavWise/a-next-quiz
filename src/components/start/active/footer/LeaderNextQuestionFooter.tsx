import AnswersCollectionProgress from "./AnswersCollectionProgress"
import LeaderNextQuestionButton from "./LeaderNextQuestionButton"

const EMPTY_ANSWERS: number[] = []
const EMPTY_USERS: number[] = []

export interface LeaderNextQuestionFooterProps {
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
  return (
    <footer className="bottom-next fixed right-0 left-0 z-50 shrink-0 p-4 sm:p-5">
      {collectingAnswers ? (
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
