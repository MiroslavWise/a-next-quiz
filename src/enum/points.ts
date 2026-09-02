export const enum Points {
  VERY_LOW = 500,
  LOW = 800,
  MEDIUM = 900,
  HIGH = 1000,
  VERY_HIGH = 1150,
  EXTREME = 1300,
  ULTRA = 1500,
  MAX = 2000,
}

const POINTS_MAP: Record<Points, string> = {
  [Points.VERY_LOW]: "500 pts",
  [Points.LOW]: "800 pts",
  [Points.MEDIUM]: "900 pts",
  [Points.HIGH]: "1000 pts",
  [Points.VERY_HIGH]: "1150 pts",
  [Points.EXTREME]: "1300 pts",
  [Points.ULTRA]: "1500 pts",
  [Points.MAX]: "2000 pts",
}

const POINTS_MAP_S: Record<Points, string> = {
  [Points.VERY_LOW]: "500",
  [Points.LOW]: "800",
  [Points.MEDIUM]: "900",
  [Points.HIGH]: "1000",
  [Points.VERY_HIGH]: "1150",
  [Points.EXTREME]: "1300",
  [Points.ULTRA]: "1500",
  [Points.MAX]: "2000",
}

export const getPointsStringS = (points: Points) => POINTS_MAP_S?.[points] ?? "0"
export const arrayPoints = Object.entries(POINTS_MAP) as unknown as [Points, string][]
