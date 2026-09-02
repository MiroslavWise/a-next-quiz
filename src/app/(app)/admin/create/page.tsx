"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import Button from "@/components/ui/button"
import CreateQuiz from "@/components/forms/CreateQuiz"

export default function AdminQuizCreate() {
  return (
    <div className="flex w-full flex-col pt-5">
      <div className="flex w-full flex-row items-center justify-between gap-4 py-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin" className="inline-flex items-center gap-1.5">
            <ArrowLeft className="size-3.5" />
          </Link>
        </Button>
        <div className="flex w-full flex-col">
          <h2 className="text-lg font-semibold tracking-tight">Создание нового квиза</h2>
          <p className="text-muted-foreground text-sm">Заполните данные квиза и сохраните его.</p>
        </div>
      </div>
      <CreateQuiz />
    </div>
  )
}
