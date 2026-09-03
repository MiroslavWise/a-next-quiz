import type { Metadata } from "next"

import { SITE_NAME, SITE_ORIGIN } from "@/lib/site"
import { RANDOM_PRIZE_MIN_CORRECT_PERCENT } from "@/lib/report-prizes"
import { STREAK_BONUS_MAX_PERCENT, STREAK_BONUS_STEP_PERCENT } from "@/lib/game-streak-tiers"

const PAGE_PATH = "/game-mechanics"
export const PAGE_URL = `${SITE_ORIGIN}${PAGE_PATH}`
export const OG_IMAGE = `${SITE_ORIGIN}/og/game-mechanics.jpg`

export const GAME_MECHANICS_TITLE = "Механика игры QAND — правила викторины, очки и стихии"
export const GAME_MECHANICS_DESCRIPTION =
  "Как устроена викторина QAND: фазы матча, очки за скорость, стихии огня, воды, земли и воздуха, одноразовые способности, серии верных ответов, бонусы вопроса и призовые места."

export const gameMechanicsMetadata: Metadata = {
  title: GAME_MECHANICS_TITLE,
  description: GAME_MECHANICS_DESCRIPTION,
  keywords: ["QAND", "викторина", "механика игры", "квиз", "стихии", "очки", "бонусы", "способности", "серия ответов", "призы"],
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    title: GAME_MECHANICS_TITLE,
    description: GAME_MECHANICS_DESCRIPTION,
    url: PAGE_URL,
    images: [
      {
        url: OG_IMAGE,
        secureUrl: OG_IMAGE,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "QAND — механика игры: четыре стихии, очки и призы",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: GAME_MECHANICS_TITLE,
    description: GAME_MECHANICS_DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: "QAND — механика игры: четыре стихии, очки и призы" }],
  },
  other: {
    "theme-color": "#0b0b10",
  },
}

export const gameMechanicsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_ORIGIN}/#app`,
      name: SITE_NAME,
      url: SITE_ORIGIN,
      applicationCategory: "GameApplication",
      operatingSystem: "Web, Telegram",
      inLanguage: "ru-RU",
    },
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#page`,
      url: PAGE_URL,
      name: "Механика игры QAND",
      headline: "Правила викторины, очки и стихии",
      description: GAME_MECHANICS_DESCRIPTION,
      inLanguage: "ru-RU",
      isPartOf: { "@id": `${SITE_ORIGIN}/#app` },
      primaryImageOfPage: { "@id": `${PAGE_URL}#image` },
    },
    {
      "@type": "ImageObject",
      "@id": `${PAGE_URL}#image`,
      url: OG_IMAGE,
      width: 1200,
      height: 630,
      caption: "QAND — механика игры",
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      isPartOf: { "@id": `${PAGE_URL}#page` },
      mainEntity: [
        {
          "@type": "Question",
          name: "Как проходит игра QAND?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ведущий создаёт сессию и делится кодом или QR. Участники заходят в лобби, выбирают стихию, подтверждают участие в окне «Участвую», затем отвечают на вопросы с таймером. В финале — таблица, подиум и поздравления призёрам в Telegram.",
          },
        },
        {
          "@type": "Question",
          name: "Как начисляются очки?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "За верный ответ — очки за скорость: в первые 3 секунды 100%, к концу таймера до 30%. Сверху добавляются бонусы серии, стихии, правила вопроса и одноразовые способности.",
          },
        },
        {
          "@type": "Question",
          name: "Что дают стихии в викторине?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Огонь, вода, земля и воздух выбираются в лобби и дают уникальные бонусы и штрафы. Без стихии остаются speed, серия и Lucky. После подтверждения участия один игрок случайно становится аватаром игры.",
          },
        },
        {
          "@type": "Question",
          name: "Что такое серия верных ответов?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Каждый верный ответ увеличивает серию, ошибка или пропуск сбрасывает её. Со 2-го верного подряд к очкам вопроса добавляется процент — шаг ${STREAK_BONUS_STEP_PERCENT}%, максимум ${STREAK_BONUS_MAX_PERCENT}%. Бонус виден в разбивке element_effects.`,
          },
        },
        {
          "@type": "Question",
          name: "Кто получает призы?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Призовые места задаёт ведущий в лобби. Дополнительно разыгрывается случайный приз среди игроков вне этих мест, если они верно ответили минимум на ${RANDOM_PRIZE_MIN_CORRECT_PERCENT}% закрытых вопросов.`,
          },
        },
      ],
    },
  ],
}
