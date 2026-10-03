export const TEAM_SPARK_MIN_PERCENT = 1
export const TEAM_SPARK_MAX_PERCENT = 11
export const TEAM_CUSHION_PERCENT = 70
export const TEAM_RESONANCE_POINTS = 50
export const TEAM_PAIR_STREAK_STEP_PERCENT = 2
export const TEAM_PAIR_STREAK_MAX_PERCENT = 12

export type TeamBonusDefinition = {
  id: string
  title: string
  short: string
  detail: string
}

export const TEAM_BONUSES: readonly TeamBonusDefinition[] = [
  {
    id: "team_spark",
    title: "Искра",
    short: `${TEAM_SPARK_MIN_PERCENT}–${TEAM_SPARK_MAX_PERCENT}% base тому, кто отстаёт по счёту`,
    detail: `Если оба ответили верно, игроку с меньшим счётом на начало вопроса начисляется случайно от ${TEAM_SPARK_MIN_PERCENT} до ${TEAM_SPARK_MAX_PERCENT}% базовых очков. При равном счёте искры нет. Партнёр ничего не теряет.`,
  },
  {
    id: "team_split",
    title: "Подушка",
    short: `Верный не ниже ${TEAM_CUSHION_PERCENT}% своего итога`,
    detail: `Если верно ответил только один, а второй ошибся или пропустил, котёл делится пополам, но верный не опускается ниже ${TEAM_CUSHION_PERCENT}% своего личного итога. Остаток забирает второй. Оба неверно — обычный котёл, без этой защиты. В разборе это одна строка «Пара».`,
  },
  {
    id: "team_resonance",
    title: "Резонанс",
    short: `+${TEAM_RESONANCE_POINTS} каждому, если стихия одна`,
    detail: `Оба верно и у обоих одна и та же стихия профиля — каждому +${TEAM_RESONANCE_POINTS}. Аватар и пустая стихия не считаются. Туман личную стихию гасит, на резонанс пары это не влияет.`,
  },
  {
    id: "team_pair_streak",
    title: "Серия пары",
    short: `+${TEAM_PAIR_STREAK_STEP_PERCENT}% base за шаг, максимум ${TEAM_PAIR_STREAK_MAX_PERCENT}%`,
    detail: `Отдельный счётчик, не личная серия. Оба верно — серия +1, каждому ${TEAM_PAIR_STREAK_STEP_PERCENT}% base за шаг (1 → 2%, 2 → 4% …), потолок ${TEAM_PAIR_STREAK_MAX_PERCENT}%. Ошибка или пропуск обнуляют серию и котёл не переписывают.`,
  },
]
