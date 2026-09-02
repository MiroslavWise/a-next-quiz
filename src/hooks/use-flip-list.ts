"use client"

import { useRef, type RefObject } from "react"

/**
 * Ранее — FLIP-анимация дочерних элементов с `data-flip-id` при изменении порядка списка.
 * Анимации убраны (пакет `motion` удалён); хук оставлен для совместимости и просто
 * возвращает ref на список.
 */
export function useFlipList<T>(_items: readonly T[], _durationMs = 800): RefObject<HTMLUListElement | null> {
  return useRef<HTMLUListElement>(null)
}
