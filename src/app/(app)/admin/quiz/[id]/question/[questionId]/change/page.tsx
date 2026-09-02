"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, ArrowLeft } from "lucide-react"

import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import ChangeQuestion from "@/components/forms/ChangeQuestion"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

import { useAuthJwtClaims } from "@/lib/jwt"
import { getQuestionById } from "@/api/questions"

export default function AdminQuizQuestionChange() {
  const params = useParams() as Record<string, string | string[] | undefined>
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined
  const questionId = typeof params.questionId === "string" ? params.questionId : Array.isArray(params.questionId) ? params.questionId[0] : undefined
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id

  const { data, isFetching, error } = useQuery({
    queryKey: ["question-answers", questionId],
    queryFn: () => getQuestionById(questionId!),
    enabled: !!questionId && !!tgId,
    refetchOnMount: true,
  })

  if (isFetching)
    return (
      <section className="flex w-full flex-col pt-5">
        <header className="flex w-full items-center gap-4 py-4">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex w-full flex-col">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="mt-2 h-4 w-[70%]" />
          </div>
        </header>

        <div className="flex w-full flex-col gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      </section>
    )

  if (error)
    return (
      <div className="flex h-full w-full flex-col gap-4 pt-5">
        <header className="flex items-center gap-2 py-4">
          <Button asChild variant="outline" size="icon">
            <Link href={`/admin/quiz/${id}`}>
              <ArrowLeft className="size-3.5" />
            </Link>
          </Button>
          <h2 className="text-lg font-semibold">Редактирование вопроса</h2>
        </header>

        <Empty className="w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Не удалось загрузить вопрос</EmptyTitle>
            <EmptyDescription>Проверьте соединение и попробуйте ещё раз.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )

  return (
    <div className="flex h-full w-full flex-col gap-4 pt-5">
      <header className="flex items-center gap-2 py-4">
        <Button asChild variant="outline" size="icon">
          <Link href={`/admin/quiz/${id}`}>
            <ArrowLeft className="size-3.5" />
          </Link>
        </Button>
        <h2 className="text-lg font-semibold">Редактирование вопроса</h2>
      </header>
      <ChangeQuestion question={data!.question} answers={data!.answers || []} />
    </div>
  )
}
