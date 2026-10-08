export type MatchTitleCatalogItem = {
  id: string
  title: string
  detail: string
  rare?: boolean
}

/** Каталог достижений вечера. Тексты совпадают с экраном механики и разделом «Мои достижения». */
export const MATCH_TITLE_CATALOG: MatchTitleCatalogItem[] = [
  {
    id: "first_correct",
    title: "Первый за вечер",
    detail:
      "Больше всех закрытых вопросов, где был среди самых быстрых верных ответов. Если на вопросе одно время у 1–3 человек — кредит каждому; если у четверых и больше — вопрос никому. Достижение у лидеров счёта, когда их не больше трёх.",
  },
  {
    id: "answer_titan",
    title: "Титан ответов",
    detail: "Личная серия хотя бы раз дошла до восьми верных подряд.",
  },
  {
    id: "never_skipped",
    title: "Ни разу не пропустил",
    detail: "Редкое достижение: верный ответ на каждом закрытом вопросе. Ошибка или пропуск его снимают.",
    rare: true,
  },
  {
    id: "element_fire",
    title: "Пламя вечера",
    detail: "Больше всех очков среди игроков огня. Аватар игры в стихийных достижениях не участвует.",
  },
  {
    id: "element_water",
    title: "Голос прилива",
    detail: "Больше всех очков среди игроков воды.",
  },
  {
    id: "element_earth",
    title: "Страж земли",
    detail: "Больше всех очков среди игроков земли.",
  },
  {
    id: "element_air",
    title: "Око бури",
    detail: "Больше всех очков среди игроков воздуха.",
  },
  {
    id: "pair_flawless",
    title: "Безупречная пара",
    detail: "Оба в паре на финише верно ответили на каждый закрытый вопрос.",
    rare: true,
  },
  {
    id: "pair_unison",
    title: "В унисон",
    detail: "На финише серия пары дошла до шести верных подряд. Ошибка или пропуск последнего вопроса серию сбрасывает.",
  },
  {
    id: "pair_kin",
    title: "Родство стихий",
    detail: "Оба одной стихии, и хотя бы на одном вопросе у пары был резонанс. Аватар игры не участвует.",
  },
  {
    id: "pair_spark",
    title: "Искра двоих",
    detail: "Среди пар финиша больше всех вопросов, где вспыхнула искра. Ничья — достижение у каждой такой пары.",
  },
  {
    id: "pair_evening",
    title: "Пара вечера",
    detail: "Наибольшая сумма очков двоих на финише, если она больше нуля. Ничья — у всех с этим максимумом.",
  },
]

export function matchTitleById(id: string | null | undefined): MatchTitleCatalogItem | undefined {
  const key = id?.trim()
  if (!key) return undefined
  return MATCH_TITLE_CATALOG.find((item) => item.id === key)
}
