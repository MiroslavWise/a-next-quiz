import { api } from "./instance"
import getApiHeaders from "./api-headers"
import { ApiRequestError } from "./errors"

export type AdminCacheResetResponse = {
  ok: boolean
  cleared?: string[]
}

/** `POST /admin/cache/reset` — только админ (`Authorization: Bearer <jwt>`). */
export async function postAdminCacheReset(): Promise<AdminCacheResetResponse> {
  return api
    .post<AdminCacheResetResponse>(
      "/admin/cache/reset",
      {},
      {
        headers: getApiHeaders(),
      },
    )
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as AdminCacheResetResponse
      const body = res.data as { code?: unknown; message?: unknown } | undefined
      const message =
        typeof body?.message === "string" && body.message.trim()
          ? body.message
          : res.status === 403
            ? "Недостаточно прав"
            : "Не удалось сбросить кэш"
      const code = typeof body?.code === "string" ? body.code : undefined
      throw new ApiRequestError(message, res.status, code)
    })
}
