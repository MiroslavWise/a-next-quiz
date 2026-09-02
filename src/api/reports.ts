import getApiHeaders from "./api-headers"
import { ApiRequestError } from "./errors"
import { reportPath } from "./report-path"
import { api } from "./instance"
import type { IElementEffect } from "@/interface/element-effect"
import type { IQuiz } from "@/interface/quiz"
import type { IReport } from "@/interface/report"
import type { IAnswer } from "@/interface/answer"
import type { IQuestion } from "@/interface/question"
import type { EReportStatus } from "@/enum/report"
import { normalizeActiveIndexSnapshot } from "@/lib/normalize-active-index"

/** Ответ `GET /report/{report_id}` — см. docs/API.md. `element_avatar_id` заполняется после перехода в `START`. */
export type IReportByIdResponse = Omit<IReport, "quiz"> & {
  quiz: IQuiz | null
  questions?: IQuestion[]
}

/** Ответ `GET /report/{report_id}/active-index` — снимок активного вопроса и индекса. */
export interface IReportActiveIndexResponse {
  /** Вопрос активного индекса; `bonuses` — `string[]` или ключ отсутствует, если бонусов нет. */
  question: IQuestion
  answers: IAnswer[]
  start: unknown
  status: EReportStatus
  end: unknown
  active_index: number
}

export const postReport = async (quizId: string) => {
  return api.post("/report/create", { quiz_id: quizId }, { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IReport
    throw new Error("Failed to post report")
  })
}

export const updateToStartReport = async (reportId: string | number) => {
  return api
    .post(reportPath(reportId, "start"), undefined, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReport
      throw new Error("Failed to update report to start")
    })
}

/** Ответ `PATCH /report/{report_id}/prizes` — см. docs/API.md (ведущий = админ). */
export interface IReportPrizesPatchResponse {
  id: number
  prizes: number[]
}

export const patchReportPrizes = async (reportId: string | number, prizes: number[]) => {
  return api.patch(reportPath(reportId, "prizes"), { prizes }, { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IReportPrizesPatchResponse
    throw new Error("Failed to update report prizes")
  })
}

export const nextQuestion = async (reportId: string) => {
  return api
    .patch(reportPath(reportId, "next-question"), undefined, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as unknown
      throw new Error("Failed to next question")
    })
}

export const getRepostById = async (reportId: string) => {
  return api.get(reportPath(reportId), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IReportByIdResponse
    throw new Error("Failed to get report by id")
  })
}

export const getReports = async () => {
  return api
    .get("/reports", {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReport[]
      throw new Error("Failed to get reports")
    })
}

export const getActiveIndexQuestion = async (report: string) => {
  return api.get(reportPath(report, "active-index"), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return normalizeActiveIndexSnapshot(res.data as IReportActiveIndexResponse)
    throw new Error("Failed to get active index question")
  })
}

export const getReportById = async (reportId: string) => {
  return api.get(reportPath(reportId), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IReportByIdResponse
    throw new Error("Failed to get report")
  })
}

export const deleteReport = async (reportId: string | number) => {
  return api.delete(reportPath(reportId), { headers: getApiHeaders() }).then((res) => {
    if (res.status === 204 || (res.status >= 200 && res.status < 300)) return
    throw new Error("Failed to delete report")
  })
}

export const getReportByCode = async (code: string) => {
  return api.get(`/report`, { params: { code }, headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IReport
    const data = res.data as unknown
    const message =
      typeof data === "string"
        ? data
        : data && typeof data === "object"
          ? (data as { message?: unknown }).message && typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : (data as { error?: unknown }).error && typeof (data as { error?: unknown }).error === "string"
              ? (data as { error: string }).error
              : (data as { detail?: unknown }).detail && typeof (data as { detail?: unknown }).detail === "string"
                ? (data as { detail: string }).detail
                : undefined
          : undefined

    const err = new Error(message ?? "Не удалось получить квиз по коду")
    ;(err as any).status = res.status
    ;(err as any).data = data
    throw err
  })
}

export const addMemberToReport = async (reportId: string | number) => {
  return api.patch(reportPath(reportId, "add"), undefined, { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IReport
    throw new Error("Failed to add member to report")
  })
}

interface IAnswerQuestion {
  index: number
  questionId: string
  answerId: string
}

/** Ответ `PATCH /report/{report_id}/answer` (см. docs/API.md). */
export interface IReportAnswerPatchResponse {
  id?: number
  active_index?: number
  is_right?: boolean
  /** Эффекты стихии сразу после ответа (жар, искра, streak и т.д.). */
  element_effects?: IElementEffect[]
  /** Эффекты активированной одноразовой способности. */
  skill_effects?: ISkillEffect[]
}

export const answerQuestion = async (reportId: string, data: IAnswerQuestion) => {
  return api
    .patch(
      reportPath(reportId, "answer"),
      { index: data.index, question_id: data.questionId, answer_id: data.answerId },
      { headers: getApiHeaders() },
    )
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportAnswerPatchResponse
      const body = res.data as { code?: unknown; message?: unknown } | undefined
      const message = typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось отправить ответ"
      const code = typeof body?.code === "string" ? body.code : undefined
      throw new ApiRequestError(message, res.status, code)
    })
}

export type SkillId = "BOOST" | "SHIELD" | "THIEF" | "GAMBIT" | "TIDE" | "FOG"
export type SkillStatus = "available" | "active" | "used"

export interface ISkillState {
  id: SkillId
  title: string
  status: SkillStatus
  active_index?: number
  used_at_index?: number
}

export interface ISkillEffect {
  id:
    | "skill_boost"
    | "skill_shield"
    | "skill_shield_bonus"
    | "skill_thief_gain"
    | "skill_thief_loss"
    | "skill_thief_blocked"
    | "skill_thief_empty"
    | "skill_gambit"
    | "skill_tide"
    | "skill_fog"
    | "skill_fog_cast"
  title: string
  points: number
  status?: string
  source_telegram_id?: string
  /** Цель PvP-эффекта (например `skill_fog_cast`). */
  target_telegram_id?: string
}

export interface IReportMySkillsResponse {
  telegram_id: string
  active_index: number
  active_skill?: SkillId
  skills: ISkillState[]
}

export interface IActivateReportSkillResponse {
  skill_id: SkillId
  active_index: number
  activated_at: string
  target_telegram_id?: string
  skill_effects?: ISkillEffect[]
  skills: ISkillState[]
}

export const getReportMySkills = async (reportId: string | number) => {
  return api.get(reportPath(reportId, "my-skills"), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IReportMySkillsResponse
    throw new Error("Не удалось загрузить способности")
  })
}

export const activateReportSkill = async (
  reportId: string | number,
  data: { skillId: SkillId; index: number; questionId: string },
) => {
  return api
    .post(
      reportPath(reportId, "skill"),
      { skill_id: data.skillId, index: data.index, question_id: data.questionId },
      { headers: getApiHeaders() },
    )
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IActivateReportSkillResponse
      const body = res.data as { code?: unknown; message?: unknown } | undefined
      const message = typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось активировать способность"
      const code = typeof body?.code === "string" ? body.code : undefined
      throw new ApiRequestError(message, res.status, code)
    })
}

/** Состояние окна подтверждения участия (`POST /report/{id}/confirm`, `GET /report/{id}/checking`) — см. docs/API.md. */
export interface IReportCheckingState {
  id: number
  status: EReportStatus
  /** Только в `GET /checking`: `true`, если окно сейчас открыто в памяти сервера. */
  active?: boolean
  /** `telegram_id[]` уже подтвердивших участие, в порядке нажатия. У наблюдателя в ответе `POST /confirm` приходит `false`. */
  confirmed: number[] | false
  confirmed_count?: number
  participants_total?: number
  /** Только в ответе `POST /confirm` для наблюдателя. */
  role?: "observer"
}

/** Подтвердить участие в фазе `CHECKING` (кнопка «Участвую»). Пустой POST, `telegram_id` берётся из JWT. */
export const confirmReportParticipation = async (reportId: string | number) => {
  return api
    .post(reportPath(reportId, "confirm"), undefined, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportCheckingState
      const body = res.data as { code?: unknown; message?: unknown } | undefined
      const message = typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось подтвердить участие"
      const code = typeof body?.code === "string" ? body.code : undefined
      throw new ApiRequestError(message, res.status, code)
    })
}

/** Текущее состояние окна подтверждения (для «догона» поздно подключившихся). */
export const getReportChecking = async (reportId: string | number) => {
  return api
    .get(reportPath(reportId, "checking"), {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportCheckingState
      throw new Error("Failed to get report checking state")
    })
}

export const getReportUsers = async (reportId: string | number) => {
  return api.get(reportPath(reportId, "users"), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300)
      return res.data as {
        users: number[]
        observers: number[]
      }
    throw new Error("Failed to get report users")
  })
}

/** Исключить участника из `reports.users` (см. `DELETE /report/{report_id}/users/{telegram_id}` в docs/API.md). */
export const removeUserFromReportUsers = async (reportId: string | number, targetTelegramId: string | number) => {
  return api.delete(reportPath(reportId, `users/${targetTelegramId}`), { headers: getApiHeaders() }).then((res) => {
    if (res.status === 204 || (res.status >= 200 && res.status < 300)) return
    throw new Error("Failed to remove user from report")
  })
}

export const moveToObservers = async (reportId: string | number) => {
  return api
    .patch(reportPath(reportId, "move-to-observers"), undefined, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as { id: number }
      const body = res.data as { code?: unknown; message?: unknown } | undefined
      const message = typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось перевести в наблюдатели"
      const code = typeof body?.code === "string" ? body.code : undefined
      throw new ApiRequestError(message, res.status, code)
    })
}

type ReportMyRole = "user" | "observer"

interface IReportMyRoleResponse {
  report_id: number
  status: string
  role: ReportMyRole
}

export const getReportMyRole = async (reportId: string | number) => {
  return api
    .get(reportPath(reportId, "my-role"), {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportMyRoleResponse
      const body = res.data as { code?: unknown; message?: unknown } | undefined
      const message =
        typeof body?.message === "string" && body.message.trim()
          ? body.message
          : res.status === 403
            ? "Нет прав"
            : "Не удалось загрузить роль"
      const code = typeof body?.code === "string" ? body.code : undefined
      throw new ApiRequestError(message, res.status, code)
    })
}

/** Результат по одному вопросу в отчёте (см. API «report-my-score» / «report-user-points»). */
export interface IReportQuestionScore {
  index: number
  question_id: string
  answered: boolean
  points?: number
  is_right?: boolean
  /** Пропуск / воздержание (`users_answers.abstained`); после END может быть `true` при `is_right: false`. */
  abstained?: boolean
  /** Итог за вопрос (`points_awarded`); может быть отрицательным (штрафы при ошибке или пропуске). */
  /** Текст вопроса (если отдаёт API) */
  title?: string
  /** Разбивка очков по эффектам стихии за вопрос — см. docs/API.md. */
  element_effects?: IElementEffect[]
}

export interface IReportUserPoints {
  telegram_id: string | number
  /** Итоговые очки за квиз (приоритет над `points`); может быть отрицательным — штрафы стихий без нижнего предела. */
  total_points?: number
  rank?: number
  /** Изменение места относительно предыдущего раунда: prev_rank - current_rank */
  rank_delta?: number
  /** Очки, полученные/потерянные за сравниваемый раунд (может быть отрицательным). */
  points_delta?: number
  points?: number
  questions?: IReportQuestionScore[]
}

export function reportUserTotalPoints(item: Pick<IReportUserPoints, "points" | "total_points">): number {
  return item?.total_points ?? item?.points ?? 0
}

export const getReportUserPoints = async (reportId: string | number) => {
  return api
    .get(reportPath(reportId, "user-points"), {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportUserPoints[]
      throw new Error("Failed to get report user points")
    })
}

/** Участник в bucket ответов — `answers-correct` / `question-answer-counts` (docs/API.md). */
export interface IAnswerUserEntry {
  telegram_id: number
  /** Итог за вопрос (`points_awarded`); может быть отрицательным. */
  score: number
}

/** Категория ответов с числом и списком участников — `answers-correct` / buckets (docs/API.md). */
export interface IAnswerUsersBucket {
  count: number
  users: IAnswerUserEntry[]
}

/** Статистика ответов по вопросу — `GET /reports/{report_id}/answers-correct?index=<n>` (docs/API.md). */
export interface IReportAnswersCorrect {
  participants_total: number
  right: IAnswerUsersBucket
  wrong: IAnswerUsersBucket
  abstained: IAnswerUsersBucket
}

export const getReportsAnswersCorrect = async (reportId: string | number, index: number) => {
  return api
    .get(`/reports/${reportId}/answers-correct`, {
      params: {
        index: index,
      },
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportAnswersCorrect
      throw new Error("Failed to get report answers correct")
    })
}

export interface IReportQuestionAnswerCounts {
  question_id: string
  responses: {
    answer_id: string
    count: number
    users: IAnswerUserEntry[]
  }[]
  participants_total: number
}

export const getReportsAnswersCorrectCounts = async (reportId: string | number, index: number) => {
  return api
    .get(reportPath(reportId, "question-answer-counts"), {
      params: {
        index: index,
      },
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportQuestionAnswerCounts
      throw new Error("Failed to get report answers correct counts")
    })
}

export const reportMyScore = async (reportId: string | number) => {
  return api
    .get(reportPath(reportId, "my-score"), {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportUserPoints | number
      throw new Error("Failed to get report my score")
    })
}

/** Статистика участника по отчёту (админ/менеджер); структура как у `report-my-score`. */
export const reportUserScore = async (reportId: string | number, targetTelegramId: string | number) => {
  return api
    .get(reportPath(reportId, `user-score/${targetTelegramId}`), {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IReportUserPoints
      const body = res.data as { code?: unknown; message?: unknown } | undefined
      const message = typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось загрузить статистику"
      const code = typeof body?.code === "string" ? body.code : undefined
      throw new ApiRequestError(message, res.status, code)
    })
}

export interface IPrizesUsers {
  telegram_id: number
  place: number
  points: number
  /** Для случайного приза в конце игры — `place: 0` и `is_random: true` (см. docs/API.md). */
  is_random: boolean
}

function normalizePrizesUsers(raw: unknown): IPrizesUsers[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const row = item as Record<string, unknown>
      const telegram_id = Number(row.telegram_id)
      const place = Number(row.place ?? row.prize)
      const points = Number(row.points)
      const is_random = Boolean(row.is_random ?? row.isRandom ?? false)
      if (!Number.isFinite(telegram_id) || !Number.isFinite(place) || !Number.isFinite(points)) return null
      return { telegram_id, place, points, is_random }
    })
    .filter((item): item is IPrizesUsers => item != null)
}

export const getReportPrizesUsers = async (reportId: string | number) => {
  return api.get(reportPath(reportId, "prizes-users"), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return normalizePrizesUsers(res.data)
    const body = res.data as { code?: unknown; message?: unknown } | undefined
    const message = typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось загрузить список игроков"
    const code = typeof body?.code === "string" ? body.code : undefined
    throw new ApiRequestError(message, res.status, code)
  })
}

export enum EReportMyPassedQuestionsResult {
  CORRECT = "correct",
  WRONG = "wrong",
  SKIPPED = "skipped",
}

export interface IReportMyPassedQuestions {
  telegram_id: number
  count: number
  passed: {
    index: number
    question_id: string
    result: EReportMyPassedQuestionsResult
    answer_status: "Верно" | "Не верно" | "Воздержался (пропустил)"
    /** Для пропуска после END всегда `false` (экономически = ошибка). */
    is_right: boolean
    points: number
    element_effects?: IElementEffect[]
  }[]
}

export const getReportMyPassedQuestions = async (reportId: string | number) => {
  return api.get(reportPath(reportId, "my-passed-questions"), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IReportMyPassedQuestions
    const body = res.data as { code?: unknown; message?: unknown } | undefined
    const message =
      typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось загрузить список пройденных вопросов"
    const code = typeof body?.code === "string" ? body.code : undefined
    throw new ApiRequestError(message, res.status, code)
  })
}

/**
 * Статус ответа участника по вопросу — `GET /report/{id}/users-answers-status` (docs/API.md).
 * `waiting` только на фронте: вопрос ещё не `END` / нет ключа в матрице.
 */
export enum EUsersAnswerStatus {
  CORRECT = "correct",
  WRONG = "wrong",
  SKIPPED = "skipped",
  WAITING = "waiting",
}

/** Значения, которые реально отдаёт бэкенд (без `waiting`). */
export type TUsersAnswerStatusFromApi =
  | EUsersAnswerStatus.CORRECT
  | EUsersAnswerStatus.WRONG
  | EUsersAnswerStatus.SKIPPED

/** Матрица `{ [telegram_id]: { [index]: correct|wrong|skipped } }`. */
export type IReportUsersAnswersStatus = Record<string, Record<string, TUsersAnswerStatusFromApi>>

const API_ANSWER_STATUSES = new Set<string>([
  EUsersAnswerStatus.CORRECT,
  EUsersAnswerStatus.WRONG,
  EUsersAnswerStatus.SKIPPED,
])

function normalizeUsersAnswersStatus(raw: unknown): IReportUsersAnswersStatus {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}

  const result: IReportUsersAnswersStatus = {}
  for (const [telegramId, byIndex] of Object.entries(raw as Record<string, unknown>)) {
    if (!byIndex || typeof byIndex !== "object" || Array.isArray(byIndex)) {
      result[telegramId] = {}
      continue
    }
    const row: Record<string, TUsersAnswerStatusFromApi> = {}
    for (const [indexKey, status] of Object.entries(byIndex as Record<string, unknown>)) {
      if (typeof status === "string" && API_ANSWER_STATUSES.has(status)) {
        row[indexKey] = status as TUsersAnswerStatusFromApi
      }
    }
    result[telegramId] = row
  }
  return result
}

/** Матрица статусов ответов всех участников по закрытым вопросам (admin/manager). */
export const getReportUsersAnswersStatus = async (reportId: string | number) => {
  return api.get(reportPath(reportId, "users-answers-status"), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return normalizeUsersAnswersStatus(res.data)
    const body = res.data as { code?: unknown; message?: unknown } | undefined
    const message =
      typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось загрузить статусы ответов"
    const code = typeof body?.code === "string" ? body.code : undefined
    throw new ApiRequestError(message, res.status, code)
  })
}

/** Элемент списка завершённых игр — `GET /my-games` (docs/API.md). */
export interface IMyGame {
  id: number
  created_at: string
  quiz: {
    id: string
    name: string
    imageUrl: string | null
  } | null
}

/** Список до 10 последних завершённых игр текущего пользователя. */
export const getMyGames = async () => {
  return api.get("/my-games", { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IMyGame[]
    throw new Error("Failed to get my games")
  })
}

/** Результат квиза из снимка — поле `quiz` в `GET /report/{id}/my-game-result`. */
export interface IMyGameResultQuiz {
  uuid: string
  name: string
  description: string
  image_url: string | null
}

/** Результат вопроса в `GET /report/{id}/my-game-result`. */
export interface IMyGameResultQuestion {
  index: number
  question_id: string
  title?: string
  answered: boolean
  points: number
  is_right: boolean | null
  element_effects?: IElementEffect[]
}

/** Ответ `GET /report/{report_id}/my-game-result` (docs/API.md). */
export interface IMyGameResult {
  telegram_id: string
  total_points: number
  rank: number
  quiz: IMyGameResultQuiz | null
  questions: IMyGameResultQuestion[]
}

/** Подробный результат завершённой игры для текущего участника. */
export const getMyGameResult = async (reportId: string | number) => {
  return api.get(reportPath(reportId, "my-game-result"), { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as IMyGameResult
    const body = res.data as { code?: unknown; message?: unknown } | undefined
    const message = typeof body?.message === "string" && body.message.trim() ? body.message : "Не удалось загрузить результат игры"
    const code = typeof body?.code === "string" ? body.code : undefined
    throw new ApiRequestError(message, res.status, code)
  })
}
