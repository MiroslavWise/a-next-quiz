import type { EUserElement } from "@/enum/element"

/** Цвета акцента — из SVG в `public/element/` (см. docs/API.md, раздел «Стихии»). */
export type GameElementEffect = {
  id: string
  title: string
  short: string
  detail: string
}

export type GameElementCard = {
  id: string
  name: string
  tagline: string
  archetype: string
  description: string
  uiHint: string
  iconSrc: string
  /** Акцент карточки; для аватара — белый. */
  accentColor: string
  bonuses: GameElementEffect[]
  penalties: GameElementEffect[]
  wide?: boolean
}

export const GAME_ELEMENT_CARDS: GameElementCard[] = [
  {
    id: "FIRE",
    name: "Огонь",
    tagline: "Риск и скорость",
    archetype: "Атакующий, импульсивный",
    description: "Быстрые рывки и награда первому верно ответившему. Ошибка обжигает.",
    uiHint: "Ответь верно первым — получи искру (ошибки до вас не мешают). Ошибся — потеряешь 8% стоимости вопроса.",
    iconSrc: "/element/fire.svg",
    accentColor: "#E85D2A",
    bonuses: [
      { id: "fire_speed", title: "Жар", short: "Speed ×1.15", detail: "Speed-очки за верный ответ умножаются на 1.15." },
      { id: "fire_spark", title: "Искра", short: "+10% base", detail: "Первый верный ответ на вопросе: +10% base (ошибки до вас не мешают)." },
    ],
    penalties: [
      { id: "fire_burn", title: "Ожог", short: "−8% base", detail: "Неверный ответ или пропуск: −8% от base points вопроса (1000 → −80)." },
    ],
  },
  {
    id: "WATER",
    name: "Вода",
    tagline: "Стабильность и эмпатия",
    archetype: "Гибкая, поддерживающая",
    description: "Бонус за верный ответ и очки за каждого в зале.",
    uiHint: "Чем больше зал — тем больше эмпатия. Ошибка или пропуск отражается волной по всем присутствующим.",
    iconSrc: "/element/water.svg",
    accentColor: "#06B6D4",
    bonuses: [
      { id: "water_flow", title: "Течение", short: "+5% к ответу", detail: "Верный ответ: +5% к очкам ответа поверх streak (35%+5%=40%)." },
      { id: "water_empathy", title: "Эмпатия", short: "+5×N", detail: "Верный ответ: +5 очков за каждого игрока в игре." },
    ],
    penalties: [
      { id: "water_ripple", title: "Рябь", short: "−4×N", detail: "Неверный ответ или пропуск: −4 очка за каждого игрока в игре." },
    ],
  },
  {
    id: "EARTH",
    name: "Земля",
    tagline: "Терпение и серия",
    archetype: "Стабильная, выносливая",
    description: "Сильная серия и награда за последний верный ответ.",
    uiHint: "Копи серию — она растёт мощнее. Ответь последним, но верно — получи бонус терпения.",
    iconSrc: "/element/earth.svg",
    accentColor: "#1C8C47",
    bonuses: [
      { id: "earth_streak", title: "Корни", short: "Streak 6%→45%", detail: "Серия: +6% за шаг, максимум 45%." },
      { id: "earth_patience", title: "Терпение", short: "+17% base", detail: "Верный ответ последним: +17% от base points вопроса." },
    ],
    penalties: [],
  },
  {
    id: "AIR",
    name: "Воздух",
    tagline: "Хаос и удача",
    archetype: "Хаотичный, непредсказуемый",
    description: "Случайные порывы очков и усиленный Lucky.",
    uiHint: "Ветер приносит случайные очки. Lucky для тебя щедрее, но серия копится медленнее.",
    iconSrc: "/element/air.svg",
    accentColor: "#76E3D6",
    bonuses: [
      { id: "air_lucky", title: "Везунчик", short: "Lucky 24%", detail: "При выигрыше Lucky: 24% base вместо 12%." },
      { id: "air_gust", title: "Порыв", short: "40% → +7%", detail: "Любой исход (верный, неверный, пропуск): 40% шанс +7% base." },
      { id: "air_gust_double", title: "Усиленный порыв", short: "20% → +14%", detail: "Если порыв сработал: 20% шанс удвоить до +14% base." },
      { id: "air_streak", title: "Лёгкий ветер", short: "Streak 4%→42%", detail: "Серия: +4% за шаг, максимум 42%." },
    ],
    penalties: [],
  },
]

export const GAME_AVATAR_CARD: GameElementCard = {
  id: "AVATAR",
  name: "Аватар игры",
  tagline: "Мастер стихий",
  archetype: "Универсал без яркой специализации",
  description: "Случайный игрок после CHECKING. Стихия игрока не действует.",
  uiHint: "Тебя выбрала игра. Ты силён везде понемногу, но ошибки и потолок серии напоминают: ты не бог, а проводник.",
  iconSrc: "/element/elements.svg",
  accentColor: "#F5F5F5",
  wide: true,
  bonuses: [
    { id: "avatar_first", title: "Первенство", short: "+8% base", detail: "Первый верный ответ на вопросе: +8% base (ошибки до вас не мешают)." },
    { id: "avatar_aura", title: "Аура", short: "+7% base", detail: "Каждый верный ответ: +7% base." },
    { id: "avatar_lucky", title: "Судьба", short: "Lucky 18%", detail: "Lucky: 18% base (×1.5)." },
    { id: "avatar_presence", title: "Присутствие", short: "+1×N", detail: "В конце вопроса: +1 за игрока, даже без ответа." },
    { id: "avatar_streak_cap", title: "Потолок серии", short: "Streak max 30%", detail: "Серия как у всех (+5%), но не выше 30%." },
  ],
  penalties: [{ id: "avatar_crack", title: "Трещина", short: "−3% base", detail: "Неверный ответ или пропуск: −3% от base points." }],
}

export const GAME_AVATAR_ICON_SRC = GAME_AVATAR_CARD.iconSrc

export const GAME_ELEMENT_VISUAL_BY_ID = Object.fromEntries(
  GAME_ELEMENT_CARDS.map((card) => [card.id, { iconSrc: card.iconSrc, accentColor: card.accentColor, name: card.name }]),
) as Record<EUserElement, { iconSrc: string; accentColor: string; name: string }>
