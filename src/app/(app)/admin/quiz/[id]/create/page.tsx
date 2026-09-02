"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Button from "@/components/ui/button"
import CreateQuestion from "@/components/forms/CreateQuestion"

export default function AdminQuizQuestionCreate() {
  const params = useParams() as Record<string, string | string[] | undefined>
  const quizId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined

  return (
    <section className="flex w-full flex-col pt-5">
      <header className="flex w-full items-center gap-4 py-4">
        <Button asChild variant="outline" size="icon">
          <Link href={`/admin/quiz/${quizId}`}>
            <ArrowLeft className="size-3.5" />
          </Link>
        </Button>
        <div className="flex w-full flex-col">
          <h2 className="text-lg font-semibold tracking-tight">Новый вопрос</h2>
          <p className="text-muted-foreground text-sm">Добавьте вопрос и варианты ответов для квиза</p>
        </div>
      </header>
      <CreateQuestion quizId={quizId!} />
    </section>
  )
}
