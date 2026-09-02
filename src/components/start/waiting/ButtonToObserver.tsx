"use client"

import { Eye } from "lucide-react"
import { off, on, postEvent, type PopupButton } from "@tma.js/sdk"
import { useEffect, type Dispatch, type SetStateAction } from "react"

import { cn } from "@/lib/utils"
import { moveToObservers } from "@/api/reports"
import { LOBBY_ICON_BUTTON_CLASS, LOBBY_ICON_BUTTON_ICON_CLASS } from "@/components/start/waiting/lobby-icon-button"

interface IProps {
  movingToObserver: boolean
  tgId: number
  reportId: number
  setMovingToObserver: Dispatch<SetStateAction<boolean>>
}

function ButtonToObserver({ movingToObserver, tgId, reportId, setMovingToObserver }: IProps) {
  function handleMoveToObservers() {
    if (!reportId) return
    setMovingToObserver(true)
    const buttons: PopupButton[] = [
      {
        id: "move_to_observers",
        text: "OK",
        type: "destructive",
      },
      {
        id: "cancel_move_to_observers",
        type: "cancel",
      },
    ]

    postEvent("web_app_open_popup", {
      title: "Перейти в наблюдатели?",
      message: "Вы уверены, что хотите перейти в наблюдатели?",
      buttons: buttons,
    })
  }

  function updateToObservers() {
    moveToObservers(reportId)
      .then(() => {})
      .catch((e) => {
        console.error(e)
      })
      .finally(() => setTimeout(() => setMovingToObserver(false), 3_000))
  }

  useEffect(() => {
    if (!reportId) return

    function handlePopupClosed(event: { button_id?: string }) {
      const buttonId = (event.button_id as string) ?? ""
      if (buttonId?.includes("move_to_observers")) {
        if (buttonId === "move_to_observers") {
          updateToObservers()
          return
        }
        if (buttonId === "cancel_move_to_observers") {
          setMovingToObserver(false)
          return
        }
      }
    }

    on("popup_closed", handlePopupClosed)

    return () => {
      off("popup_closed", handlePopupClosed)
    }
  }, [reportId])

  return (
    <button
      type="button"
      onClick={handleMoveToObservers}
      title="В наблюдатели"
      aria-label="Перейти в наблюдатели"
      disabled={movingToObserver}
      className={cn(LOBBY_ICON_BUTTON_CLASS, "disabled:pointer-events-none disabled:opacity-50")}
    >
      <Eye className={LOBBY_ICON_BUTTON_ICON_CLASS} aria-hidden />
    </button>
  )
}

ButtonToObserver.displayName = "ButtonToObserver"
export default ButtonToObserver
