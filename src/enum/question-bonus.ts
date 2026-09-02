/** Бонусы вопроса — см. `POST/PATCH /questions`, `docs/API.md`. */
export enum QuestionBonus {
  TOP_THREE = "TOP_THREE",
  BOTTOM_THREE = "BOTTOM_THREE",
  BOTTOM_TWO_BY_SCORE_PLUS = "BOTTOM_TWO_BY_SCORE_PLUS",
  LUCKY_PLUS = "LUCKY_PLUS",
  FIRST_ANSWERER_LOSE_ELEMENT = "FIRST_ANSWERER_LOSE_ELEMENT",
  WRONG_ANSWER_DISABLE_ELEMENT = "WRONG_ANSWER_DISABLE_ELEMENT",
  REVERSE_SCORING = "REVERSE_SCORING",
  ALL_ELEMENTS_BOOST = "ALL_ELEMENTS_BOOST",
  PROGRESSIVE_BONUS = "PROGRESSIVE_BONUS",
  SEQUENTIAL_ORDER_BONUS = "SEQUENTIAL_ORDER_BONUS",
}

export type QuestionBonusValue = `${QuestionBonus}`

const QUESTION_BONUS_LABELS: Record<QuestionBonus, string> = {
  [QuestionBonus.TOP_THREE]: "Первые три +10%",
  [QuestionBonus.BOTTOM_THREE]: "Последние три +12%",
  [QuestionBonus.BOTTOM_TWO_BY_SCORE_PLUS]: "Слабейшие два +15%",
  [QuestionBonus.LUCKY_PLUS]: "Lucky +5%",
  [QuestionBonus.FIRST_ANSWERER_LOSE_ELEMENT]: "Первый теряет стихию",
  [QuestionBonus.WRONG_ANSWER_DISABLE_ELEMENT]: "Ошибка или пропуск отключает стихии",
  [QuestionBonus.REVERSE_SCORING]: "Обратный счёт",
  [QuestionBonus.ALL_ELEMENTS_BOOST]: "Усиление стихий",
  [QuestionBonus.PROGRESSIVE_BONUS]: "Нарастающий бонус",
  [QuestionBonus.SEQUENTIAL_ORDER_BONUS]: "Порядок верных",
}

const QUESTION_BONUS_DETAILS: Record<QuestionBonus, string> = {
  [QuestionBonus.TOP_THREE]: "Первые три ответивших с верным ответом: +10% от набранного за ответ.",
  [QuestionBonus.BOTTOM_THREE]: "Последние три ответивших с верным ответом: +12% от набранного за ответ.",
  [QuestionBonus.BOTTOM_TWO_BY_SCORE_PLUS]:
    "При закрытии вопроса: среди верных — двое с наименьшим points_awarded (до end-бонусов) получают +15% от своего счёта за ответ.",
  [QuestionBonus.LUCKY_PLUS]: "Lucky-бонус увеличен на +5% от базовых очков вопроса.",
  [QuestionBonus.FIRST_ANSWERER_LOSE_ELEMENT]: "Первый ответивший (любой клик, даже неверный) теряет бонус своей стихии на этом вопросе. Не путать с «Искрой» и «Первенством» — там нужен первый верный ответ.",
  [QuestionBonus.WRONG_ANSWER_DISABLE_ELEMENT]:
    "При неверном ответе или пропуске стихия отключается на этот вопрос. Не действует на аватара игры — у него остаются бонусы и штрафы аватара (в т.ч. «Трещина» −3% base).",
  [QuestionBonus.REVERSE_SCORING]:
    "После обычного расчёта (speed, стихия, серия): верный ответ — −5% от base вопроса; неверный ответ или пропуск — +10% от base. Стихии и speed не отменяются — это дополнительная поправка. End-бонусы (топ-3, Lucky и т.д.) считаются от уже записанного points_awarded.",
  [QuestionBonus.ALL_ELEMENTS_BOOST]:
    "Усиливает параметры огня, воды, земли и воздуха на этом вопросе (аватар и игроки без стихии — без изменений). Огонь: speed ×1.22, первый верный +13% base, ошибка −11%. Вода: +8% к ответу, +7×N / −6×N. Земля: любой верный +15% base при ответе (классическое «терпение» при END отключено). Воздух: порыв 55% → +9%, 25% → +18% base.",
  [QuestionBonus.PROGRESSIVE_BONUS]:
    "Только за верный ответ. Место в очереди верных: priorCorrect + 1 — неверные ответы до вас не сдвигают очередь. 1-й верный: +3% от счёта за ответ; 2-й: +5%; 3-й: +7%; далее +2% за каждого следующего верного (4-й: +9%, 5-й: +11% …).",
  [QuestionBonus.SEQUENTIAL_ORDER_BONUS]:
    "Только за верный ответ. Штраф или бонус от base вопроса по месту среди верных; N = число игроков в report.users. Формула: −N% + 2N·(i−1)/(N−1). 1-й верный — до −N% base; если все N ответят верно — N-й получает +N% base. Неверные и пропуски в очередь не входят.",
}

export const QUESTION_BONUS_OPTIONS = Object.values(QuestionBonus).map((value) => ({
  value,
  label: QUESTION_BONUS_LABELS[value],
  detail: QUESTION_BONUS_DETAILS[value],
}))

export function getQuestionBonusLabel(bonus: QuestionBonusValue): string {
  return QUESTION_BONUS_LABELS[bonus as QuestionBonus] ?? bonus
}

export function getQuestionBonusDetail(bonus: QuestionBonusValue): string {
  return QUESTION_BONUS_DETAILS[bonus as QuestionBonus] ?? bonus
}

const NEGATIVE_QUESTION_BONUSES = new Set<QuestionBonus>([
  QuestionBonus.FIRST_ANSWERER_LOSE_ELEMENT,
  QuestionBonus.WRONG_ANSWER_DISABLE_ELEMENT,
  QuestionBonus.REVERSE_SCORING,
  QuestionBonus.SEQUENTIAL_ORDER_BONUS,
])

export function isNegativeQuestionBonus(bonus: QuestionBonus): boolean {
  return NEGATIVE_QUESTION_BONUSES.has(bonus)
}

export function getQuestionBonusSwitchColor(bonus: QuestionBonus): string {
  return isNegativeQuestionBonus(bonus) ? "bg-(--unfaithful)" : "bg-(--accent-orb)"
}

const QUESTION_BONUS_VALUES = new Set<string>(Object.values(QuestionBonus))

export function normalizeQuestionBonuses(bonuses: readonly (QuestionBonus | string)[] | null | undefined): QuestionBonus[] {
  if (!bonuses?.length) return []
  return bonuses.filter((value): value is QuestionBonus => typeof value === "string" && QUESTION_BONUS_VALUES.has(value))
}

export function questionBonusesEqual(a: QuestionBonus[] | null | undefined, b: QuestionBonus[] | null | undefined): boolean {
  const left = normalizeQuestionBonuses(a).sort()
  const right = normalizeQuestionBonuses(b).sort()
  return left.length === right.length && left.every((value, index) => value === right[index])
}

export function questionBonusesToApi(bonuses: QuestionBonus[] | null | undefined): QuestionBonus[] | null {
  const normalized = normalizeQuestionBonuses(bonuses)
  return normalized.length > 0 ? normalized : null
}

/** Начисляются при закрытии вопроса (END) — видны в `element_effects` после END. */
export const QUESTION_BONUSES_AT_END: readonly QuestionBonus[] = [
  QuestionBonus.TOP_THREE,
  QuestionBonus.BOTTOM_THREE,
  QuestionBonus.BOTTOM_TWO_BY_SCORE_PLUS,
  QuestionBonus.LUCKY_PLUS,
]

/** Влияют на начисление при ответе или пропуске. */
export const QUESTION_BONUSES_ON_ANSWER: readonly QuestionBonus[] = [
  QuestionBonus.FIRST_ANSWERER_LOSE_ELEMENT,
  QuestionBonus.WRONG_ANSWER_DISABLE_ELEMENT,
  QuestionBonus.REVERSE_SCORING,
  QuestionBonus.ALL_ELEMENTS_BOOST,
  QuestionBonus.PROGRESSIVE_BONUS,
  QuestionBonus.SEQUENTIAL_ORDER_BONUS,
]

export type AllElementsBoostRow = {
  name: string
  iconSrc: string
  accentColor: string
  normal: string
  boosted: string
}

/** Сравнение параметров стихий с бонусом `ALL_ELEMENTS_BOOST` — см. docs/API.md. */
export const ALL_ELEMENTS_BOOST_COMPARISON: readonly AllElementsBoostRow[] = [
  {
    name: "Огонь",
    iconSrc: "/element/fire.svg",
    accentColor: "#FF0000",
    normal: "Speed ×1.15; первый верный +10% base; ошибка −8%",
    boosted: "×1.22; +13%; −11%",
  },
  {
    name: "Вода",
    iconSrc: "/element/water.svg",
    accentColor: "#06B6D4",
    normal: "Верный +5% к ответу; +5×N; ошибка −4×N",
    boosted: "+8%; +7×N; −6×N",
  },
  {
    name: "Земля",
    iconSrc: "/element/earth.svg",
    accentColor: "#1C8C47",
    normal: "Последний верный +17% base (при END)",
    boosted: "Любой верный +15% base при ответе; «терпение» при END отключено",
  },
  {
    name: "Воздух",
    iconSrc: "/element/air.svg",
    accentColor: "#76E3D6",
    normal: "Порыв 40% → +7% base; 20% → +14%",
    boosted: "55% → +9%; 25% → +18%",
  },
]

/** Шкала PROGRESSIVE_BONUS: +3%, +5%, +7%, … (+2% за каждого следующего верного). */
export const PROGRESSIVE_BONUS_SCALE: readonly { positionLabel: string; percent: number }[] = [
  { positionLabel: "1-й верный", percent: 3 },
  { positionLabel: "2-й", percent: 5 },
  { positionLabel: "3-й", percent: 7 },
  { positionLabel: "4-й", percent: 9 },
  { positionLabel: "5-й", percent: 11 },
  { positionLabel: "6-й", percent: 13 },
]

/** Пример SEQUENTIAL_ORDER_BONUS при N = 10, base = 1000 — см. docs/API.md. */
export const SEQUENTIAL_ORDER_BONUS_EXAMPLE: readonly {
  positionLabel: string
  percent: number
  points: number
}[] = [
  { positionLabel: "1-й верный", percent: -10, points: -100 },
  { positionLabel: "2-й", percent: -8, points: -80 },
  { positionLabel: "3-й", percent: -6, points: -60 },
  { positionLabel: "6-й", percent: 1, points: 10 },
  { positionLabel: "10-й (все ответили)", percent: 10, points: 100 },
]
