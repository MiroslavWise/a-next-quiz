export const enum Time {
  LOW = 15,
  MEDIUM = 20,
  HIGH = 30,
  VERY_HIGH = 40,
  EXTREME = 50,
  ULTRA = 60,
}

const TIME_MAP: Record<Time, string> = {
  [Time.LOW]: "15 секунд",
  [Time.MEDIUM]: "20 секунд",
  [Time.HIGH]: "30 секунд",
  [Time.VERY_HIGH]: "40 секунд",
  [Time.EXTREME]: "50 секунд",
  [Time.ULTRA]: "60 секунд",
}
const TIME_MAP_S: Record<Time, string> = {
  [Time.LOW]: "15s",
  [Time.MEDIUM]: "20s",
  [Time.HIGH]: "30s",
  [Time.VERY_HIGH]: "40s",
  [Time.EXTREME]: "50s",
  [Time.ULTRA]: "60s",
}

export const getTimeStringS = (time: Time) => TIME_MAP_S[time]
export const arrayTime = Object.entries(TIME_MAP) as unknown as [Time, string][]
