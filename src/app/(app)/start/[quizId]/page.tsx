import StartQuizClient from "./start-quiz-client"

export default async function StartQuizPage({ params }: PageProps<"/start/[quizId]">) {
  const { quizId } = await params
  return <StartQuizClient quizId={quizId} />
}
