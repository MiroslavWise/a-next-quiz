"use client"

import { useEffect } from "react"

/** Слот последнего события одного `type` — независим от других типов. */
export type SocketEventSlot<T> = {
  seq: number
  event: T
}

export type LastSocketEventByType<T> = Partial<Record<string, SocketEventSlot<T>>>

const EMPTY_DEPS: readonly unknown[] = []

function eventTypeKey(event: { type?: unknown }): string {
  return typeof event.type === "string" && event.type.length > 0 ? event.type : "_unknown"
}

/** Пишет событие в слот своего `type`, не затирая остальные. */
export function nextSocketEventByType<T extends { type?: string }>(
  prev: LastSocketEventByType<T>,
  event: T,
  seq: number,
): LastSocketEventByType<T> {
  return {
    ...prev,
    [eventTypeKey(event)]: { seq, event },
  }
}

/** Самое свежее (по `seq`) событие среди указанных типов. */
export function latestSocketEventOfTypes<T>(lastByType: LastSocketEventByType<T> | undefined, types: readonly string[]): T | null {
  if (!lastByType) return null
  let best: SocketEventSlot<T> | undefined
  for (const type of types) {
    const slot = lastByType[type]
    if (!slot) continue
    if (!best || slot.seq > best.seq) best = slot
  }
  return best?.event ?? null
}

/**
 * Эффект только на события данного `type`. Другие типы сокета его не перезапускают.
 * `extraDeps` — как в `useEffect`: пропсы, без которых обработчик не должен «догонять» слот.
 */
export function useSocketEventEffect<T>(
  lastByType: LastSocketEventByType<T> | undefined,
  type: string,
  effect: (event: T) => void | (() => void),
  extraDeps: readonly unknown[] = EMPTY_DEPS,
): void {
  const slot = lastByType?.[type]

  useEffect(() => {
    if (!slot) return
    return effect(slot.event)
    // Слот — идентичность события этого type; extraDeps задаёт вызывающий.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- контракт: type-слот + явные extraDeps
  }, [slot, ...extraDeps])
}
