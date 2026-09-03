import { cn } from "@/lib/utils"

export const ANSWER_LETTERS = ["А", "Б", "В", "Г"] as const

export function indexToAnswerLetter(index: number): string {
  return ANSWER_LETTERS[index] ?? String(index + 1)
}

const obj = {
  0: "one",
  1: "two",
  2: "three",
  3: "four",
} as const

function isOrbIndex(index: number): index is keyof typeof obj {
  return Object.hasOwn(obj, index)
}

export const indexToString = (index: number, { glass = false }: { glass?: boolean } = {}) => {
  if (!isOrbIndex(index)) return ""
  const name = obj[index]
  if (glass) {
    return cn(
      `border-(--orb-bg-${name})`,
      "border-2 bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md",
    )
  }
  return `border-(--orb-bg-${name}) bg-(--orb-bg-${name})`
}
