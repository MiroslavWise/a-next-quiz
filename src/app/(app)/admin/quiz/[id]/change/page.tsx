import AdminQuizChangeClient from "./admin-quiz-change-client"

export default async function AdminQuizChangePage({ params }: PageProps<"/admin/quiz/[id]/change">) {
  const { id } = await params
  return <AdminQuizChangeClient id={id} />
}
