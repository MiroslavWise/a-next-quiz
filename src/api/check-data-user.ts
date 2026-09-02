import { api } from "./instance"
import type { AuthRoles } from "@/enum/auth"

export const postCheckDataUser = async (data: string) => {
  return api
    .post(
      "/check-data-user",
      {},
      {
        headers: {
          Authorization: `tma ${data}`,
        },
      },
    )
    .then((res) => {
      if (res.status >= 200 && res.status < 300) return res.data as IDataCheckUser

      throw new Error("Failed to check data user")
    })
    .catch((err) => {
      console.error(err)
      throw new Error("Failed to check data user")
    })
}

interface IDataCheckUser {
  token: string
  ok: boolean
  telegram_id: number
  is_admin: boolean
  is_manager: boolean
  role: AuthRoles
}
