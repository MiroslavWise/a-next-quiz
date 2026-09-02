import getApiHeaders from "./api-headers"
import { ApiRequestError } from "./errors"
import { api } from "./instance"
import type { IStaffRolesResponse } from "@/interface/staff"

export const getStaffRoles = async () => {
  return api
    .get("/staff-roles", {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IStaffRolesResponse
      const body = res.data as { code?: unknown; message?: unknown } | undefined
      const message =
        typeof body?.message === "string" && body.message.trim()
          ? body.message
          : res.status === 403
            ? "Недостаточно прав"
            : "Не удалось загрузить список"
      const code = typeof body?.code === "string" ? body.code : undefined
      throw new ApiRequestError(message, res.status, code)
    })
}
