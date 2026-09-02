import { ANIME, WINDOWS } from "@/config/env"
type TTgId = number | undefined
export const isGetAnimeUser = (tgId: TTgId) => (!tgId ? false : Number(ANIME) === tgId)
export const isGetWindows = (id: TTgId) => (!id ? false : Number(WINDOWS) === id)
