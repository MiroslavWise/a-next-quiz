import AdminQuizQuestionCreateClient from "./admin-quiz-question-create-client"

export default async function AdminQuizQuestionCreatePage({ params }: PageProps<"/admin/quiz/[id]/create">) {
  const { id } = await params
  return <AdminQuizQuestionCreateClient quizId={id} />
}
