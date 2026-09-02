import AnswersCollectionProgress from "./AnswersCollectionProgress"

export interface ObserverAnswersFooterProps {
  answeredCount: number
  participantsTotal: number
  answers: number[]
  users: number[]
}

export default function ObserverAnswersFooter({ answeredCount, participantsTotal, answers, users }: ObserverAnswersFooterProps) {
  return (
    <footer
      className="bottom-next fixed right-0 left-0 z-50 mt-auto flex shrink-0 flex-col p-4 sm:p-5"
      aria-live="polite"
    >
      <AnswersCollectionProgress answeredCount={answeredCount} participantsTotal={participantsTotal} answers={answers} users={users} />
    </footer>
  )
}
