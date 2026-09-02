"use client"

import { postEvent } from "@tma.js/sdk"
import { useRouter } from "next/navigation"
import { EllipsisVertical, PencilLine, Trash } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Button from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import type { IQuestion } from "@/interface/question"

interface IProps extends IQuestion {
  quizId: string
}

function MenuItemQuestion({ quizId, id, title }: IProps) {
  const router = useRouter()

  async function handleDeleteQuestion() {
    const buttons: any[] = [
      {
        id: "delete_question" + "|" + id,
        text: "Удалить",
        type: "destructive",
      },
      {
        id: "cancel",
        text: "Отмена",
        type: "cancel",
      },
    ]

    postEvent("web_app_open_popup", {
      title: "Удалить вопрос",
      message: "Вы уверены, что хотите удалить вопрос «" + title + "»?",
      buttons: buttons,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant="outline" className="hover:bg-muted cursor-pointer px-1.5" aria-label="Меню вопроса">
          <EllipsisVertical />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="w-full">
            <Button
              variant="link"
              className="flex w-full items-center justify-start"
              onClick={() => router.push(`/admin/quiz/${quizId}/question/${id}/change`)}
            >
              <PencilLine className="size-4" /> Редактировать
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="w-full">
            <Button variant="link" className="text-destructive flex w-full items-center justify-start" onClick={handleDeleteQuestion}>
              <Trash className="size-4" /> Удалить
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

MenuItemQuestion.displayName = "MenuItemQuestion"
export default MenuItemQuestion
