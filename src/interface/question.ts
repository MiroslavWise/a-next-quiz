import type { IAnswer } from "./answer"
import type { EUserElement } from "@/enum/element"
import type { QuestionBonus } from "@/enum/question-bonus"

export interface IQuestion {
  created_at: string
  id: string
  title: string
  quizId: string
  points: number
  time: number
  /** Бонусы вопроса (`GET /questions`, `active-index`, Socket.IO `data.question.bonuses`). Ключа нет, если бонусов нет. */
  bonuses?: QuestionBonus[] | null
  /** Метка стихии вопроса. `null` или ключ отсутствует — бонуса нет. Аватара в значении нет. */
  element?: EUserElement | null
  /** Фаза стихии аватара на каждом 3-м вопросе (active-index, Socket.IO `data.question.avatar_phase`). */
  avatar_phase?: "FIRE" | "WATER" | "EARTH" | "AIR" | null
  /** Публичный URL картинки вопроса (`GET /questions`, `GET /questions/{id}`) */
  imageUrl?: string | null
  image_url?: string | null
  image_path?: string | null
}

export interface IQuestionWithAnswers extends IQuestion {
  answers: IAnswer[]
}
