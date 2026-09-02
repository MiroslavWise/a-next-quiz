"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { GitBranchPlus, ArrowLeft, Play } from "lucide-react"
import { on, off, postEvent, type PopupButton } from "@tma.js/sdk"

import Button from "@/components/ui/button"
import Skeleton from "@/components/ui/skeleton"
import MenuQuiz from "@/components/common/MenuQuiz"
import { CardDescription, CardTitle } from "@/components/ui/card"
import ComponentsQuestions from "@/components/common/ComponentsQuestions"

import { postReport } from "@/api/reports"
import { useAuthJwtClaims } from "@/lib/jwt"
import type { IQuiz } from "@/interface/quiz"
import { TELEGRAM_BOT_USERNAME } from "@/config/env"
import { deleteQuestion, getQuestions } from "@/api/questions"
import { deleteQuiz, getQuizById, getQuizes } from "@/api/quizes"

export default function AdminQuizDetails() {
  const claims = useAuthJwtClaims()
  const isAdmin = claims?.is_admin ?? false
  const tgId = claims?.telegram_id
  const router = useRouter()
  const params = useParams() as Record<string, string | string[] | undefined>
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : undefined

  const { data, isLoading } = useQuery({
    queryKey: ["quiz", id],
    enabled: !!id && !!tgId,
    queryFn: () => getQuizById(id!),
  })

  const { refetch: refetchQuizes } = useQuery({
    queryKey: ["quizes"],
    enabled: false,
    queryFn: getQuizes,
  })

  const {
    data: questions,
    isLoading: isLoadingQuestions,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: ["questions", id],
    queryFn: () => getQuestions(id!),
    enabled: !!id && !!tgId,
    refetchOnMount: true,
  })

  async function handleDelete(str: string) {
    const [action, deleteId] = str.split("|")
    if (action === "delete_question") {
      try {
        await deleteQuestion(deleteId)
        await refetchQuestions()
      } catch (error) {
        console.error(error)
      }
    } else if (action === "delete_quiz") {
      try {
        await deleteQuiz(deleteId)
        refetchQuizes()
        router.replace("/admin")
      } catch (error) {
        console.error(error)
      }
    }
  }

  async function handleStartQuiz(str: string) {
    const [action, startId] = str.split("|")
    if (action === "start_quiz") {
      try {
        const res = await postReport(startId)
        const joinUrl = res?.code ? `https://t.me/${TELEGRAM_BOT_USERNAME}?startapp=${res.code}` : ""

        if (joinUrl) {
          try {
            await navigator.clipboard.writeText(joinUrl)
          } catch (copyError) {
            console.error(copyError)
          }
        }

        router.push(`/start/${res?.id}`)
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    if (!isAdmin) return

    function handlePopupClosed(event: { button_id?: string }) {
      const buttonId = event.button_id as string
      if (buttonId.includes("start_quiz") && buttonId.includes("|")) return handleStartQuiz(buttonId)
      if (buttonId.includes("|")) return handleDelete(buttonId)
    }

    on("popup_closed", handlePopupClosed)

    return () => {
      off("popup_closed", handlePopupClosed)
    }
  }, [isAdmin])

  const quiz = data ?? ({} as IQuiz)
  const coverUrl = quiz.imageUrl ?? quiz.image_url

  function handleStart() {
    const buttons: PopupButton[] = [
      {
        id: "start_quiz" + "|" + id,
        text: "Начать",
        type: "destructive",
      },
      {
        id: "cancel",
        type: "cancel",
      },
    ]

    postEvent("web_app_open_popup", {
      title: "Начать квиз",
      message: "Вы уверены, что хотите начать квиз «" + quiz?.name || "Квиз" + "»?",
      buttons: buttons,
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col">
        <header className="flex w-full flex-row items-center justify-between gap-2 py-4">
          <div className="flex flex-row items-center gap-2">
            <Skeleton className="size-9 rounded-lg" />
          </div>
          <div className="flex w-full flex-col">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="mt-2 h-4 w-[65%]" />
          </div>
          <Skeleton className="size-9 rounded-lg" />
        </header>
        <div className="bg-border -mx-4 h-px w-[calc(100%+2rem)]" />
        <ComponentsQuestions quizId={id!} questions={[]} isLoading={true} tgId={tgId!} />
        <footer className="border-border -mx-4 mt-auto flex w-[calc(100%+2rem)] items-center justify-end border-t p-4">
          <Skeleton className="h-11 w-full rounded-xl" />
        </footer>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex flex-col gap-3 py-3">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href={`/admin`}>
              <ArrowLeft className="size-3.5" />
            </Link>
          </Button>
          <div className="flex w-full flex-col">
            <CardTitle>{quiz?.name ?? "Квиз"}</CardTitle>
            <CardDescription>{quiz?.description ?? "Страница для редактирования"}</CardDescription>
          </div>
          <MenuQuiz {...quiz} handleStart={handleStart} />
        </div>
        <Button
          variant="destructive"
          size="default"
          className="flex w-full flex-row items-center justify-center"
          onClick={handleStart}
          disabled={isLoadingQuestions || !questions || questions?.length === 0}
        >
          Начать квиз <Play className="size-3.5" />
        </Button>
      </header>
      <div className="bg-border -mx-4 h-px w-[calc(100%+2rem)]" />
      {coverUrl ? (
        <div className="w-full pt-1 pb-4">
          <div className="border-border/80 bg-muted/25 aspect-video overflow-hidden rounded-xl border">
            <img
              src={coverUrl}
              alt={quiz.name ? `Обложка: ${quiz.name}` : "Обложка квиза"}
              className="aspect-video h-auto w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      ) : null}
      <ComponentsQuestions quizId={id!} questions={questions ?? []} isLoading={isLoadingQuestions} tgId={tgId!} />
      <footer className="border-border -mx-4 mt-auto flex w-[calc(100%+2rem)] items-center justify-end border-t p-4">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/admin/quiz/${id}/create`} className="inline-flex w-full items-center justify-center gap-1.5">
            <span>Добавить вопрос</span>
            <GitBranchPlus className="size-3.5" />
          </Link>
        </Button>
      </footer>
    </div>
  )
}
