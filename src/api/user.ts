import getApiHeaders from "./api-headers"
import { api } from "./instance"
import type { EUserElement } from "@/enum/element"
import type { IUser } from "@/interface/user"
import type { UpdateUserFormData } from "@/schemas/update-user"

export const patchUserProfile = async (body: Partial<UpdateUserFormData>) => {
  return api
    .patch(`/user`, body, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IUser
      throw new Error("Failed to update profile")
    })
}

export const getUserByTgId = async (userId: string | number) => {
  return api
    .get(`/user/${userId}`, {
      headers: getApiHeaders(),
    })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IUser
      throw new Error("Failed to get user by tg id")
    })
}

/** Выбор или смена стихии текущего пользователя — см. `PATCH /user/element` в docs/API.md. */
export const patchUserElement = async (element: EUserElement) => {
  return api
    .patch(`/user/element`, { element }, { headers: getApiHeaders() })
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IUser
      throw new Error("Failed to update user element")
    })
}
