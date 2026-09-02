/** Ошибка HTTP-запроса с телом JSON (`code`, `message`) от бэкенда. */
export class ApiRequestError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.code = code
  }

  static is(e: unknown): e is ApiRequestError {
    return e instanceof ApiRequestError
  }
}
