import ChangeQuiz from "@/components/forms/ChangeQuiz"
import type { IQuiz } from "@/interface/quiz"

const previewQuiz: IQuiz = {
  id: "preview-quiz",
  name: "Тестовый квиз",
  description: "Краткое описание для превью формы редактирования.",
  created_at: "2026-01-01T00:00:00Z",
  imageUrl: "https://placehold.co/640x360/png",
  image_url: "https://placehold.co/640x360/png",
  image_path: "preview/cover.png",
}

export default function PagePreview() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-6">
      <ChangeQuiz quiz={previewQuiz} />
    </main>
  )
}
