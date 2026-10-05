"use client"

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

export type PairBezierLink = {
  id: string
  color: string
  a: number
  b: number
  pulse?: boolean
}

type AnchorBox = {
  left: number
  right: number
  cy: number
}

type DrawnPath = {
  id: string
  d: string
  color: string
  pulse?: boolean
}

function round(value: number) {
  return Math.round(value * 10) / 10
}

function readAnchor(container: HTMLElement, telegramId: number): AnchorBox | null {
  const el = container.querySelector<HTMLElement>(`[data-pair-anchor="${CSS.escape(String(telegramId))}"]`)
  if (!el) return null
  const containerRect = container.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  const left = rect.left - containerRect.left + container.scrollLeft
  const top = rect.top - containerRect.top + container.scrollTop
  return {
    left: round(left),
    right: round(left + rect.width),
    cy: round(top + rect.height / 2),
  }
}

/** Горизонтальное ребро: касательная как у React Flow, с прогибом в узком зазоре. */
function horizontalPath(a: AnchorBox, b: AnchorBox) {
  const source = a.left <= b.left ? a : b
  const target = source === a ? b : a
  const x1 = source.right
  const y1 = source.cy
  const x2 = target.left
  const y2 = target.cy
  const distance = x2 - x1
  const control = distance >= 0 ? distance * 0.5 : 0.25 * 25 * Math.sqrt(-distance)
  const sag = Math.min(18, Math.max(12, Math.abs(distance) * 0.45))
  return `M ${x1} ${y1} C ${round(x1 + control)} ${round(y1 + sag)}, ${round(x2 - control)} ${round(y2 + sag)}, ${x2} ${y2}`
}

/** Вертикальная скобка слева: огибает чужие строки, у пар разный вынос. */
function verticalPath(a: AnchorBox, b: AnchorBox, gutter: number) {
  const top = a.cy <= b.cy ? a : b
  const bottom = top === a ? b : a
  const x1 = top.left
  const y1 = top.cy
  const x2 = bottom.left
  const y2 = bottom.cy
  const leftX = round(Math.min(x1, x2) - gutter)
  return `M ${x1} ${y1} C ${leftX} ${y1}, ${leftX} ${y2}, ${x2} ${y2}`
}

function samePaths(prev: DrawnPath[], next: DrawnPath[]) {
  if (prev.length !== next.length) return false
  return prev.every((path, index) => {
    const other = next[index]
    return path.id === other.id && path.d === other.d && path.color === other.color && path.pulse === other.pulse
  })
}

export function pairAvatarRingStyle(color: string): CSSProperties {
  return { boxShadow: `0 0 0 2px ${color}` }
}

export function PairBezierOverlay({
  pairs,
  orientation,
}: {
  pairs: PairBezierLink[]
  orientation: "horizontal" | "vertical"
}) {
  "use no memo"
  const uid = useId().replace(/:/g, "")
  const pairsRef = useRef(pairs)
  pairsRef.current = pairs
  const signature = pairs.map((pair) => `${pair.id}:${pair.a}:${pair.b}:${pair.color}:${pair.pulse ? 1 : 0}`).join("|")
  const [paths, setPaths] = useState<DrawnPath[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const container = svgRef.current?.parentElement
    if (!(container instanceof HTMLElement)) return

    const measure = () => {
      const next: DrawnPath[] = []
      pairsRef.current.forEach((pair, index) => {
        const a = readAnchor(container, pair.a)
        const b = readAnchor(container, pair.b)
        if (!a || !b) return
        const gutter = 6 + (index % 3) * 4
        next.push({
          id: pair.id,
          color: pair.color,
          pulse: pair.pulse,
          d: orientation === "horizontal" ? horizontalPath(a, b) : verticalPath(a, b, gutter),
        })
      })
      setPaths((prev) => (samePaths(prev, next) ? prev : next))
      const w = container.scrollWidth
      const h = container.scrollHeight
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }

    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(container)
    container.querySelectorAll<HTMLElement>("[data-pair-anchor]").forEach((el) => resizeObserver.observe(el))
    const mutationObserver = new MutationObserver(schedule)
    mutationObserver.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-pair-anchor"] })

    const scrollers: HTMLElement[] = []
    let node: HTMLElement | null = container
    while (node) {
      const overflow = getComputedStyle(node)
      if (/(auto|scroll)/.test(overflow.overflowY) || /(auto|scroll)/.test(overflow.overflowX)) scrollers.push(node)
      node = node.parentElement
    }
    scrollers.forEach((el) => el.addEventListener("scroll", schedule, { passive: true }))
    window.addEventListener("resize", schedule)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      scrollers.forEach((el) => el.removeEventListener("scroll", schedule))
      window.removeEventListener("resize", schedule)
    }
  }, [orientation, signature])

  return (
    <svg
      ref={svgRef}
      className={cn(
        "pointer-events-none absolute top-0 left-0 overflow-visible",
        orientation === "horizontal" ? "z-0" : "z-20",
      )}
      width={size.w}
      height={size.h}
      aria-hidden
    >
      <defs>
        {paths.map((path, index) => (
          <linearGradient
            key={path.id}
            id={`${uid}-${index}`}
            x1="0"
            y1="0"
            x2={orientation === "vertical" ? "0" : "1"}
            y2={orientation === "vertical" ? "1" : "0"}
          >
            <stop offset="0%" stopColor={path.color} stopOpacity="0.45" />
            <stop offset="50%" stopColor={path.color} stopOpacity="1" />
            <stop offset="100%" stopColor={path.color} stopOpacity="0.45" />
          </linearGradient>
        ))}
      </defs>
      {paths.map((path, index) => (
        <g key={path.id} className={path.pulse ? "animate-pulse" : undefined}>
          <path d={path.d} fill="none" stroke={path.color} strokeWidth={6} strokeOpacity={0.28} strokeLinecap="round" />
          <path d={path.d} fill="none" stroke={`url(#${uid}-${index})`} strokeWidth={2} strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}

export function PairBezierFrame({
  pairs,
  className,
  onClick,
  children,
}: {
  pairs: PairBezierLink[]
  className?: string
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
  children: ReactNode
}) {
  return (
    <div className={cn("relative", className)} onClick={onClick}>
      {children}
      <PairBezierOverlay pairs={pairs} orientation="horizontal" />
    </div>
  )
}
