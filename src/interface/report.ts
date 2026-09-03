import type { EReportStatus } from "@/enum/report"

/** Совпадает с enum в Supabase (`public`, значения WAITING, START, GAME, END). */
export interface IReport {
  id: number
  created_at: string
  quiz_id: string
  user_id: number
  status: EReportStatus
  code: `${number}${number}${number}${number}${number}${number}`
  /** Призовые места (номера мест). `[]`, если не заданы — см. `GET /report/{report_id}`, `GET /reports`. */
  prizes: number[]
  /**
   * `telegram_id` игрока-«аватара» игры.
   * `null`, пока отчёт не перешёл `CHECKING` → `START` (назначается сервером случайно из подтвердивших участников).
   * См. `GET /report/{report_id}`, `GET /reports`.
   */
  element_avatar_id: number | null
  quiz: {
    id: string
    name: string
    /** Публичная ссылка на обложку; `null`, если нет — см. `GET /reports`, `GET /my-games`. */
    imageUrl: string | null
  } | null
}
