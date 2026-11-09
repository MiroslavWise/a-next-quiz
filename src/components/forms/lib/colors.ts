/** Сколько полей ответа показывает форма вопроса. Пустые не уходят на сервер. */
export const ANSWER_OPTION_SLOTS = 6

export const COLORS_BUTTON: Record<number, string> = {
  0: "bg-(--orb-bg-one)",
  1: "bg-(--orb-bg-two)",
  2: "bg-(--orb-bg-three)",
  3: "bg-(--orb-bg-four)",
  4: "bg-(--orb-bg-five)",
  5: "bg-(--orb-bg-six)",
}

export function getColor(index: number) {
  return COLORS_BUTTON[index] ?? "bg-gray-600"
}
