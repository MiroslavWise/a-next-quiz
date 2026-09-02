export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://a-golang-quiz-youth-825737499561.europe-west1.run.app"
const TIMEOUT_MS = 60_000

type RequestConfig = {
  params?: Record<string, string | number | undefined>
  headers?: Record<string, string>
}

function toSearchParams(params?: Record<string, string | number | undefined>) {
  if (!params) return undefined
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string | number][]
  if (entries.length === 0) return undefined
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))
}

function buildUrl(path: string, searchParams?: URLSearchParams): string {
  const base = API_URL.replace(/\/$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(normalizedPath, `${base}/`)
  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })
  }
  return url.toString()
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function toAxiosShape<T>(responsePromise: Promise<Response>): Promise<{ status: number; data: T }> {
  const response = await responsePromise
  const data = await parseBody<T>(response)
  return { status: response.status, data }
}

/**
 * Тот же контракт, что был с ky/axios: { status, data }, чтобы не менять остальные модули в `app/api`.
 */
export const api = {
  get<T = unknown>(url: string, config?: RequestConfig) {
    const qs = toSearchParams(config?.params)
    return toAxiosShape<T>(
      fetchWithTimeout(buildUrl(url, qs), {
        method: "GET",
        headers: config?.headers,
      }),
    )
  },

  post<T = unknown>(url: string, body?: unknown, config?: RequestConfig) {
    const qs = toSearchParams(config?.params)
    const headers: Record<string, string> = { ...config?.headers }
    let requestBody: BodyInit | undefined

    if (body === undefined) {
      requestBody = undefined
    } else if (body instanceof FormData) {
      delete headers["Content-Type"]
      requestBody = body
    } else if (body instanceof Blob || body instanceof ArrayBuffer) {
      requestBody = body
      if (!headers["Content-Type"] && body instanceof Blob && body.type) {
        headers["Content-Type"] = body.type
      }
    } else {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
      requestBody = JSON.stringify(body)
    }

    return toAxiosShape<T>(
      fetchWithTimeout(buildUrl(url, qs), {
        method: "POST",
        headers,
        body: requestBody,
      }),
    )
  },

  patch<T = unknown>(url: string, body?: unknown, config?: RequestConfig) {
    const qs = toSearchParams(config?.params)
    const headers: Record<string, string> = { ...config?.headers }
    if (body !== undefined) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
    }
    return toAxiosShape<T>(
      fetchWithTimeout(buildUrl(url, qs), {
        method: "PATCH",
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    )
  },

  delete<T = unknown>(url: string, config?: RequestConfig) {
    const qs = toSearchParams(config?.params)
    return toAxiosShape<T>(
      fetchWithTimeout(buildUrl(url, qs), {
        method: "DELETE",
        headers: config?.headers,
      }),
    )
  },
}
