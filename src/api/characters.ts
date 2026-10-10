import type { EUserElement } from "@/enum/element"

import getApiHeaders from "./api-headers"
import { api } from "./instance"

export type CharacterElement = EUserElement

export interface ICharacterAbility {
  id: string
  level: number
  title: string
  detail: string
  unlocked: boolean
}

export interface ICharacterCard {
  element: CharacterElement
  name: string
  current_level: number
  total_points: number
  points_to_next_level: number
  next_level_threshold: number
  games_played: number
  progress_percent: number
  abilities_unlocked: string[]
  abilities_locked: string[]
}

export interface ICharacterDetail extends ICharacterCard {
  ladder: ICharacterAbility[]
}

export interface ICharactersResponse {
  telegram_id: string
  characters: ICharacterCard[]
}

export interface ICharacterAwardShare {
  element: CharacterElement
  points_gained: number
  level_before: number
  level_after: number
  unlocked?: string[]
}

export interface ICharacterAward {
  telegram_id: string
  kind: "element" | "avatar" | "none"
  element?: CharacterElement
  base_points: number
  points_gained: number
  level_before?: number
  level_after?: number
  top_percent?: number
  prize_percent?: number
  unlocked?: string[]
  shares?: ICharacterAwardShare[]
}

export const getMyCharacters = async () => {
  return api.get("/characters/me", { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as ICharactersResponse
    throw new Error("Не удалось загрузить персонажей")
  })
}

export const getMyCharacter = async (element: string) => {
  return api.get(`/characters/me/${element}`, { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as ICharacterDetail
    throw new Error("Не удалось загрузить персонажа")
  })
}

export const patchCharacterName = async (element: string, name: string) => {
  return api.patch(`/characters/me/${element}`, { name }, { headers: getApiHeaders() }).then((res) => {
    if (res.status >= 200 && res.status < 300) return res.data as ICharacterDetail
    throw new Error("Не удалось сохранить имя")
  })
}
