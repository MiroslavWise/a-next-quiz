import CreateQuestion from "@/components/forms/CreateQuestion"

export default function PagePreview() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <CreateQuestion quizId="preview" />
    </main>
  )
}
