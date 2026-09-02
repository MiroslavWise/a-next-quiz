import { FolderOpen } from "lucide-react"

import ItemQuestion from "./ItemQuestion"
import Skeleton from "@/components/ui/skeleton"
import { EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Empty } from "@/components/ui/empty"

import type { IQuestion } from "@/interface/question"

interface IProps {
  quizId: string
  questions: IQuestion[]
  isLoading: boolean
  tgId: number
}

function ComponentsQuestions({ quizId, questions, isLoading, tgId }: IProps) {
  return (
    <div className="flex w-full flex-col gap-2 py-4">
      {isLoading ? (
        <div className="flex h-full w-full flex-col gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`::${index + quizId}`} className="flex w-full items-center gap-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : questions?.length > 0 ? (
        <ul className="flex w-full flex-col gap-2">
          {questions.map((question, index) => (
            <ItemQuestion key={question.id} {...question} quizId={quizId} index={index} tgId={tgId} />
          ))}
        </ul>
      ) : (
        <Empty className="w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen />
            </EmptyMedia>
            <EmptyTitle>Вопросов нет</EmptyTitle>
            <EmptyDescription>В этом квизе нет вопросов. Добавьте первый вопрос, чтобы начать.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}

ComponentsQuestions.displayName = "ComponentsQuestions"
export default ComponentsQuestions

//getQuestions
