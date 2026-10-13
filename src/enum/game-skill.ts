import type { SkillId, SkillStatus, SkillVariant } from "@/api/reports"

export type GameSkillVariantOption = {
  id: SkillVariant
  title: string
  detail: string
}

export interface GameSkillDefinition {
  id: SkillId
  title: string
  short: string
  detail: string
  condition?: string
  /** PvP-способность против лидеров: недоступна игроку из топ-3. */
  pvp?: boolean
  needsVariant?: boolean
  variants?: readonly GameSkillVariantOption[]
}

export const GAME_SKILLS: readonly GameSkillDefinition[] = [
  {
    id: "BOOST",
    title: "Ускорение",
    short: "Два варианта на следующий вопрос",
    detail:
      "После верного ответа на следующем вопросе остаются два варианта. Путь A — два случайных из четырёх. Путь B — верный и один ложный.",
    needsVariant: true,
    variants: [
      { id: "A", title: "Путь A", detail: "Два случайных из четырёх" },
      { id: "B", title: "Путь B", detail: "Верный и один ложный" },
    ],
  },
  {
    id: "SHIELD",
    title: "Щит",
    short: "Гасит одну следующую ошибку",
    detail:
      "После верного ответа заряд висит до первой ошибки или пропуска: серия не рвётся, штрафы этого вопроса снимаются. Пока заряд висит, он блокирует Вора.",
  },
  {
    id: "THIEF",
    title: "Вор",
    short: "Кража очков у лидера",
    detail:
      "В конце вопроса крадёт до 8% стоимости вопроса у случайного игрока из топ-3, выбранного в момент активации. Со всех воров за вопрос цель теряет не больше 8% base, а общий счёт матча не опускается ниже нуля — даже если за этот вопрос она получила 0. Щит цели блокирует кражу.",
    condition: "Доступен вне топ-3, если в игре не меньше четырёх участников.",
    pvp: true,
  },
  {
    id: "GAMBIT",
    title: "Ставка",
    short: "Риск на следующий вопрос",
    detail:
      "После любого ответа действует на следующем вопросе. Путь A: верный ответ утраивает очки вопроса, ошибка или пропуск обнуляет их. Путь B: верный ответ удваивает очки, ошибка считается как обычно.",
    needsVariant: true,
    variants: [
      { id: "A", title: "Путь A", detail: "Верный ×3, ошибка или пропуск — 0" },
      { id: "B", title: "Путь B", detail: "Верный ×2, ошибка как обычно" },
    ],
  },
  {
    id: "TIDE",
    title: "Прилив",
    short: "Бонус за верно ответивших",
    detail:
      "При верном ответе +1.5% стоимости вопроса за каждого другого игрока, ответившего верно на этом вопросе, потолок +15%. Считается в конце вопроса по итоговому числу верных ответов. Неверный ответ или пропуск — 0.",
  },
  {
    id: "FOG",
    title: "Туман",
    short: "Гасит стихию лидера",
    detail:
      "Наводится на случайного игрока из топ-3 и отключает его стихию на этот вопрос: он теряет бонусы и недостатки стихии, включая «Свою стихию» за метку вопроса. Аватар матча не затрагивается, щит цели не блокирует туман.",
    condition: "Доступен вне топ-3, если в игре не меньше четырёх участников.",
    pvp: true,
  },
] as const

export const ELEMENTAL_SKILLS: readonly GameSkillDefinition[] = [
  {
    id: "ELEM_FIRE",
    title: "Инферно",
    short: "Speed ×1.5 на два вопроса",
    detail: "После верного ответа следующие два вопроса дают в полтора раза больше очков за скорость.",
    condition: "Свой слот Огня. Открывается с третьего вопроса.",
  },
  {
    id: "ELEM_WATER",
    title: "Водный рывок",
    short: "Следующий ответ засчитывается",
    detail: "После ошибки или пропуска следующий ваш ответ засчитывается верным.",
    condition: "Свой слот Воды. Открывается с третьего вопроса.",
  },
  {
    id: "ELEM_AIR",
    title: "Вихрь знаний",
    short: "Три вопроса без своей стихии",
    detail: "После верного ответа следующие три вопроса не применяют бонус и штраф «своя стихия».",
    condition: "Свой слот Воздуха. Открывается с третьего вопроса.",
  },
  {
    id: "ELEM_EARTH",
    title: "Твердыня",
    short: "Щит на два вопроса",
    detail: "После любого ответа следующие два вопроса: один заряд гасит ошибку или пропуск, как щит.",
    condition: "Свой слот Земли. Открывается с третьего вопроса.",
  },
] as const

export const ULTIMATE_SKILLS: readonly GameSkillDefinition[] = [
  {
    id: "ULT_FIRE",
    title: "Феникс",
    short: "Один раз за матч",
    detail: "На вопросе нет дебаффов и минусов, серия не сбрасывается. Верный ответ получает +40% базы, ошибка или пропуск — 0.",
    condition: "Открывается на 10 уровне Огня.",
  },
  {
    id: "ULT_WATER",
    title: "Прилив жизни",
    short: "Один раз за матч",
    detail: "За верный ответ тебе +2% базы на каждого игрока. Каждому другому верному ответу +30 очков, даже если ты ошибся.",
    condition: "Открывается на 10 уровне Воды.",
  },
  {
    id: "ULT_EARTH",
    title: "Гранит",
    short: "Один раз за матч",
    detail: "Иммунитет к дебаффам, серия не сбрасывается, скорость ответа ×1.30. Верный ответ дополнительно +10% базы.",
    condition: "Открывается на 10 уровне Земли.",
  },
  {
    id: "ULT_AIR",
    title: "Смерч",
    short: "Один раз за матч",
    detail: "Каждый игрок получает множитель 0.6, 1.0 или 1.4 к очкам вопроса. Тебе дополнительно +10% базы.",
    condition: "Открывается на 10 уровне Воздуха.",
  },
]

const ALL_DEFINITIONS = [...GAME_SKILLS, ...ELEMENTAL_SKILLS, ...ULTIMATE_SKILLS]

export function getGameSkillDefinition(skillId: SkillId): GameSkillDefinition {
  return ALL_DEFINITIONS.find((skill) => skill.id === skillId) ?? GAME_SKILLS[0]
}

export function allGameSkillIds(): SkillId[] {
  return ALL_DEFINITIONS.map((skill) => skill.id)
}

export function isElementalSkillId(skillId: SkillId): boolean {
  return skillId.startsWith("ELEM_")
}

export function isUltimateSkillId(skillId: SkillId): boolean {
  return skillId.startsWith("ULT_")
}

const STATUS_LABEL: Record<SkillStatus, string> = {
  available: "Доступна",
  active: "Активна",
  used: "Использована",
  locked: "Закрыта",
}

export function gameSkillLockLabel(
  status: SkillStatus,
  flags?: { isElemental?: boolean; isUltimate?: boolean },
): string {
  if (status !== "locked") return STATUS_LABEL[status]
  if (flags?.isElemental) return "Откроется с третьего вопроса"
  if (flags?.isUltimate) return "Откроется на 10 уровне"
  return STATUS_LABEL.locked
}
