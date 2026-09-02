import AdminQuizDetailsClient from "./admin-quiz-details-client"

export default async function AdminQuizDetailsPage({ params }: PageProps<"/admin/quiz/[id]">) {
  const { id } = await params
  return <AdminQuizDetailsClient id={id} />
}
