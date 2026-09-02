"use client"

import io from "socket.io-client"
import { useEffect, useMemo, useReducer } from "react"

import { API_URL } from "@/api/instance"
import { nextSocketEventByType, type LastSocketEventByType } from "@/hooks/socket-event-by-type"

export type QuizEvent = {
  type?: string
  status?: string
  [key: string]: unknown
}

type Options = {
  reportId: string | number
  /** `false` — не подключаться и отключить сокет (например отчёт уже в статусе END). */
  enabled?: boolean
}

export type UseQuizSocketIOState = {
  isConnected: boolean
  lastMessage: QuizEvent | null
  lastByType: LastSocketEventByType<QuizEvent>
  error: string | null
  connectSeq: number
}

type SocketState = {
  isConnected: boolean
  lastMessage: QuizEvent | null
  lastByType: LastSocketEventByType<QuizEvent>
  error: string | null
  connectSeq: number
  eventSeq: number
}

const initialSocketState: SocketState = {
  isConnected: false,
  lastMessage: null,
  lastByType: {},
  error: null,
  connectSeq: 0,
  eventSeq: 0,
}

type SocketAction =
  | { type: "RESET" }
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" }
  | { type: "CONNECT_ERROR" }
  | { type: "QUIZ_EVENT"; payload: QuizEvent }
  | { type: "QUIZ_ERROR"; message: string }

function socketReducer(state: SocketState, action: SocketAction): SocketState {
  switch (action.type) {
    case "RESET":
      return { ...initialSocketState }
    case "CONNECTED":
      return { ...state, isConnected: true, error: null, connectSeq: state.connectSeq + 1 }
    case "DISCONNECTED":
      return { ...state, isConnected: false }
    case "CONNECT_ERROR":
      return { ...state, isConnected: false, error: "socket.io connection error" }
    case "QUIZ_EVENT": {
      const eventSeq = state.eventSeq + 1
      return {
        ...state,
        lastMessage: action.payload,
        eventSeq,
        lastByType: nextSocketEventByType(state.lastByType, action.payload, eventSeq),
      }
    }
    case "QUIZ_ERROR":
      return { ...state, error: action.message }
    default:
      return state
  }
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "")
}

export function useQuizSocketIO({ reportId, enabled = true }: Options): UseQuizSocketIOState {
  const [state, dispatch] = useReducer(socketReducer, initialSocketState)

  const normalizedBaseUrl = useMemo(() => normalizeBaseUrl(API_URL), [])

  useEffect(() => {
    if (!reportId || !enabled) return

    dispatch({ type: "RESET" })

    const socket: any = io(normalizedBaseUrl, {
      path: "/socket.io",
      // По API.md сервер отдаёт события через Socket.IO.
      // В некоторых прокси/инфраструктурах polling может отдавать 503, тогда принудительно только websocket.
      transports: ["websocket"],
      reconnection: true,
      timeout: 10_000,
    })

    const onConnect = () => {
      dispatch({ type: "CONNECTED" })
      socket.emit("quiz:join", reportId)
      console.info("[socket] emit quiz:join", { reportId })
    }

    const onDisconnect = (reason: string) => {
      dispatch({ type: "DISCONNECTED" })
      console.warn("[socket] disconnect", { reportId, reason })
    }

    const onReconnectAttempt = (attempt: number) => {
      console.info("[socket] reconnect_attempt", { reportId, attempt })
    }

    const onReconnect = (attempt: number) => {
      console.info("[socket] reconnect (ok)", { reportId, attempt })
    }

    const onReconnectError = (err: unknown) => {
      console.warn("[socket] reconnect_error", { reportId, err })
    }

    const onReconnectFailed = () => {
      console.error("[socket] reconnect_failed (исчерпаны попытки)", { reportId })
    }

    const onConnectError = (err: unknown) => {
      dispatch({ type: "CONNECT_ERROR" })
      console.error("[socket] connect_error", { reportId, err })
    }

    const onQuizEvent = (payload: unknown) => {
      let parsed: unknown = payload
      if (typeof payload === "string") {
        try {
          parsed = JSON.parse(payload)
        } catch {
          // оставляем строку как есть
        }
      }

      // Эмоции временно не обрабатываем — лишние ререндеры и нагрузка на UI.
      if (parsed && typeof parsed === "object" && (parsed as QuizEvent).type === "emotion") return

      dispatch({ type: "QUIZ_EVENT", payload: parsed as QuizEvent })
    }

    const onQuizError = (payload: any) => {
      const msg = typeof payload?.message === "string" ? payload.message : "quiz join error"
      console.error("[socket] quiz:error", { reportId, payload })
      dispatch({ type: "QUIZ_ERROR", message: msg })
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("reconnect_attempt", onReconnectAttempt)
    socket.on("reconnect", onReconnect)
    socket.on("reconnect_error", onReconnectError)
    socket.on("reconnect_failed", onReconnectFailed)
    socket.on("connect_error", onConnectError)
    socket.on("quiz:event", onQuizEvent)
    socket.on("quiz:error", onQuizError)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("reconnect_attempt", onReconnectAttempt)
      socket.off("reconnect", onReconnect)
      socket.off("reconnect_error", onReconnectError)
      socket.off("reconnect_failed", onReconnectFailed)
      socket.off("connect_error", onConnectError)
      socket.off("quiz:event", onQuizEvent)
      socket.off("quiz:error", onQuizError)
      socket.disconnect()
    }
  }, [normalizedBaseUrl, reportId, enabled])

  return {
    isConnected: state.isConnected,
    lastMessage: state.lastMessage,
    lastByType: state.lastByType,
    error: state.error,
    connectSeq: state.connectSeq,
  }
}
