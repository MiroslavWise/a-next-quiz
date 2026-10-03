import type { ITeam } from "@/api/reports"

const PAIR_COLORS = ["#38bdf8", "#f472b6", "#a78bfa", "#fbbf24", "#34d399", "#fb7185"] as const

export function pairColor(teamId: string) {
  let hash = 0
  for (let i = 0; i < teamId.length; i++) hash = (hash * 31 + teamId.charCodeAt(i)) >>> 0
  return PAIR_COLORS[hash % PAIR_COLORS.length]
}

export function teamOfMember(teams: ITeam[] | undefined, telegramId: number) {
  return teams?.find((team) => team.members.includes(telegramId))
}

export function partnerTelegramId(team: ITeam | undefined, telegramId: number) {
  if (!team) return undefined
  return team.members.find((id) => id !== telegramId)
}
