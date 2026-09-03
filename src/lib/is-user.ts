import { ANIME } from "@/config/env"

type TTgId = number | undefined

export const isGetAnimeUser = (tgId: TTgId) => (!tgId ? false : Number(ANIME) === tgId)
