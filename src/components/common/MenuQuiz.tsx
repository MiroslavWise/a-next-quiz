"use client"

import type { DispatchWithoutAction } from "react"
import { postEvent, type PopupButton } from "@tma.js/sdk"
import { EllipsisVertical, PencilLine, Play, Trash } from "lucide-react"

import Button from "../ui/button"
import Separator from "../ui/separator"
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer"

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
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <EllipsisVertical className="size-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-sm flex-col gap-2 px-4 pb-8">
          <Button variant="outline" className="flex w-full items-center justify-start" onClick={handleStart} size="default">
            <Play className="size-4" /> Начать квиз
          </Button>
          <Button variant="outline" className="flex w-full items-center justify-start" disabled size="default">
            <PencilLine className="size-4" /> Редактировать
          </Button>
          <Separator />
          {isAdmin ? (
            <Button
              variant="destructive"
              className="text-destructive flex w-full items-center justify-start"
              onClick={handleDeleteQuiz}
              size="default"
            >
              <Trash className="size-4" /> Удалить
            </Button>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

MenuQuiz.displayName = "MenuQuiz"
export default MenuQuiz
