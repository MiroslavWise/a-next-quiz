"use client"

import type { DispatchWithoutAction } from "react"
import { postEvent, type PopupButton } from "@tma.js/sdk"
import { EllipsisVertical, PencilLine, Play, Trash } from "lucide-react"

import Button from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

import { useAuthJwtClaims } from "@/lib/jwt"
import type { IQuiz } from "@/interface/quiz"

interface IProps extends IQuiz {
  handleStart: DispatchWithoutAction
}

function MenuQuiz({ id, name, handleStart }: IProps) {
  const claims = useAuthJwtClaims()
  const isAdmin = claims?.is_admin ?? false

  function handleDeleteQuiz() {
    const buttons: PopupButton[] = [
      {
        id: "delete_quiz" + "|" + id,
        text: "Удалить",
        type: "destructive",
      },
      {
        id: "cancel",
        type: "cancel",
      },
    ]

    postEvent("web_app_open_popup", {
      title: "Удалить квиз?",
      message: "Вы уверены, что хотите удалить квиз «" + name + "»?",
      buttons: buttons,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <EllipsisVertical className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleStart}>
            <Play className="size-4" />
            Начать квиз
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <PencilLine className="size-4" />
            Редактировать
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {isAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={handleDeleteQuiz}>
                <Trash className="size-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

MenuQuiz.displayName = "MenuQuiz"
export default MenuQuiz
