"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, ArrowLeft } from "lucide-react"

import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import ChangeQuiz from "@/components/forms/ChangeQuiz"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

import { getQuizById } from "@/api/quizes"
import { useAuthJwtClaims } from "@/lib/jwt"

export default function AdminQuizChangeClient({ id }: { id: string }) {
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id

  const { data, isFetching, error } = useQuery({
    queryKey: ["quiz", id],
    queryFn: () => getQuizById(id),
    enabled: !!id && !!tgId,
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

  if (error || !data)
    return (
      <div className="flex w-full flex-col gap-4 pt-5">
        <header className="flex items-center gap-2 py-4">
          <Button asChild variant="outline" size="icon">
            <Link href={`/admin/quiz/${id}`}>
              <ArrowLeft className="size-3.5" />
            </Link>
          </Button>
          <h2 className="text-lg font-semibold">Редактирование квиза</h2>
        </header>

        <Empty className="w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Не удалось загрузить квиз</EmptyTitle>
            <EmptyDescription>Проверьте соединение и попробуйте ещё раз.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )

  return (
    <div className="flex w-full flex-col gap-4 pt-5">
      <header className="flex items-center gap-2 py-4">
        <Button asChild variant="outline" size="icon">
          <Link href={`/admin/quiz/${id}`}>
            <ArrowLeft className="size-3.5" />
          </Link>
        </Button>
        <div className="flex w-full flex-col">
          <h2 className="text-lg font-semibold">Редактирование квиза</h2>
          <p className="text-muted-foreground text-sm">Измените название, описание или обложку.</p>
        </div>
      </header>
      <ChangeQuiz quiz={data} />
    </div>
  )
}
