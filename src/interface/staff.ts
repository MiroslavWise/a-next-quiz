import type { IUser } from "./user"

/** Элемент списка `GET /staff-roles` (см. docs/API.md). */
export interface IStaffRoleEntry {
  telegram_id: string
  user: IUser | null
}

export interface IStaffRolesResponse {
  admins: IStaffRoleEntry[]
  managers: IStaffRoleEntry[]
}
