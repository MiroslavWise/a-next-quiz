export const TEAM_SPARK_MIN_PERCENT = 1
export const TEAM_SPARK_MAX_PERCENT = 11
export const TEAM_CUSHION_PERCENT = 70
export const TEAM_WRONG_SHARE_PERCENT = 20
export const TEAM_BOTH_MISS_PERCENT = 5
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
    short: `Верный оставляет ${TEAM_CUSHION_PERCENT}%, партнёр получает ${TEAM_WRONG_SHARE_PERCENT}%`,
    detail: `Если верно ответил только один и его итог больше нуля, он оставляет ${TEAM_CUSHION_PERCENT}% своих очков вопроса. Партнёр получает свои очки плюс ${TEAM_WRONG_SHARE_PERCENT}% итога верного. Оставшиеся примерно 10% сгорают. Если итог верного не больше нуля, котёл делится пополам. Оба неверно — тоже пополам, и каждому дополнительно −${TEAM_BOTH_MISS_PERCENT}% базы вопроса («Оба мимо»). Пропуск считается ошибкой.`,
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
