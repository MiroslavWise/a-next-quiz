"use client"

import io from "socket.io-client"
import { useEffect, useMemo, useReducer, useRef } from "react"

import { API_URL } from "@/api/instance"
import { nextSocketEventByType, type LastSocketEventByType } from "@/hooks/socket-event-by-type"

/** `count-answers.users`: telegram_id → answer_id (docs/API.md). */
export type CountAnswersUsers = Record<string, string>

/** Payload `quiz:staff-event` — см. docs/API.md (`count-answers`, `skill-activated`). */
export type QuizStaffEvent = {
  type?: string
  status?: string
  index?: number
  users?: CountAnswersUsers
  time?: number
  report_id?: string | number
  /** `skill-activated`: кто активировал способность. */
  telegram_id?: number | string
  /** `skill-activated`: id способности (`BOOST`, `SHIELD`, …). */
  skill_id?: string
  [key: string]: unknown
}

type Options = {
  reportId: string | number
  /** Подключать только ведущему / наблюдателю во время игры. */
  enabled?: boolean
}

export type UseQuizStaffSocketIOState = {
  isConnected: boolean
  lastMessage: QuizStaffEvent | null
  lastByType: LastSocketEventByType<QuizStaffEvent>
  error: string | null
}

type SocketState = {
  isConnected: boolean
  lastMessage: QuizStaffEvent | null
  lastByType: LastSocketEventByType<QuizStaffEvent>
  error: string | null
  eventSeq: number
}

const initialSocketState: SocketState = {
  isConnected: false,
  lastMessage: null,
  lastByType: {},
  error: null,
  eventSeq: 0,
}

type SocketAction =
  | { type: "RESET" }
  | { type: "CONNECTED" }
  | { type: "DISCONNECTED" }
  | { type: "CONNECT_ERROR" }
  | { type: "STAFF_EVENT"; payload: QuizStaffEvent }
  | { type: "STAFF_ERROR"; message: string }

function socketReducer(state: SocketState, action: SocketAction): SocketState {
  switch (action.type) {
    case "RESET":
      return { ...initialSocketState }
    case "CONNECTED":
      return { ...state, isConnected: true, error: null }
    case "DISCONNECTED":
      return { ...state, isConnected: false }
    case "CONNECT_ERROR":
      return { ...state, isConnected: false, error: "socket.io staff connection error" }
    case "STAFF_EVENT": {
      const eventSeq = state.eventSeq + 1
      return {
        ...state,
        lastMessage: action.payload,
        eventSeq,
        lastByType: nextSocketEventByType(state.lastByType, action.payload, eventSeq),
      }
    }
    case "STAFF_ERROR":
      return { ...state, error: action.message }
    default:
      return state
  }
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "")
}

export function useQuizStaffSocketIO({ reportId, enabled = true }: Options): UseQuizStaffSocketIOState {
  const socketRef = useRef<ReturnType<typeof io> | null>(null)
  const [state, dispatch] = useReducer(socketReducer, initialSocketState)

  const normalizedBaseUrl = useMemo(() => normalizeBaseUrl(API_URL), [])

  useEffect(() => {
    if (!reportId || !enabled) return

    dispatch({ type: "RESET" })

    const socket = io(normalizedBaseUrl, {
      path: "/socket.io/staff",
      transports: ["websocket"],
      reconnection: true,
      timeout: 10_000,
    })

    socketRef.current = socket

    const onConnect = () => {
      dispatch({ type: "CONNECTED" })
      socket.emit("quiz:join", reportId)
      console.info("[socket/staff] emit quiz:join", { reportId })
    }

    const onDisconnect = (reason: string) => {
      dispatch({ type: "DISCONNECTED" })
      console.warn("[socket/staff] disconnect", { reportId, reason })
    }

    const onConnectError = (err: unknown) => {
      dispatch({ type: "CONNECT_ERROR" })
      console.error("[socket/staff] connect_error", { reportId, err })
    }

    const onStaffEvent = (payload: unknown) => {
      let parsed: unknown = payload
      if (typeof payload === "string") {
        try {
          parsed = JSON.parse(payload)
        } catch {
          // оставляем строку
        }
      }
      dispatch({ type: "STAFF_EVENT", payload: parsed as QuizStaffEvent })
    }

    const onStaffError = (payload: { message?: unknown }) => {
      const msg = typeof payload?.message === "string" ? payload.message : "quiz staff join error"
      console.error("[socket/staff] quiz:error", { reportId, payload })
      dispatch({ type: "STAFF_ERROR", message: msg })
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)
    socket.on("quiz:staff-event", onStaffEvent)
    socket.on("quiz:error", onStaffError)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
      socket.off("quiz:staff-event", onStaffEvent)
      socket.off("quiz:error", onStaffError)
      socket.disconnect()
      socketRef.current = null
    }
  }, [normalizedBaseUrl, reportId, enabled])

  return {
    isConnected: state.isConnected,
    lastMessage: state.lastMessage,
    lastByType: state.lastByType,
    error: state.error,
  }
}
