import type { EUserElement } from "@/enum/element"

export interface IUser {
  created_at: string
  first_name: string
  last_name: string
  photo_url: string
  pseudo: string
  telegram_id: number
  updated_at: string
  username: string
  avatar: string
  bg: string
  /** Стихия игрока; `null`, если ещё не выбрана — см. `PATCH /user/element`. */
  element: EUserElement | null
}
