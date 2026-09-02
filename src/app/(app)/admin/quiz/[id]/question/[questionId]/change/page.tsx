import AdminQuizQuestionChangeClient from "./admin-quiz-question-change-client"

export default async function AdminQuizQuestionChangePage({
  params,
}: PageProps<"/admin/quiz/[id]/question/[questionId]/change">) {
  const { id, questionId } = await params
  return <AdminQuizQuestionChangeClient id={id} questionId={questionId} />
}
