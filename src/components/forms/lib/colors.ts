export const COLORS_BUTTON: Record<number, string> = {
  0: "bg-(--orb-bg-one)",
  1: "bg-(--orb-bg-two)",
  2: "bg-(--orb-bg-three)",
  3: "bg-(--orb-bg-four)",
}

export function getColor(index: number) {
  return COLORS_BUTTON[index] ?? "bg-gray-600"
}
