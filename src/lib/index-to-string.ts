const obj = {
  0: "one",
  1: "two",
  2: "three",
  3: "four",
} as const

function isOrbIndex(index: number): index is keyof typeof obj {
  return Object.hasOwn(obj, index)
}

export const indexToString = (index: number) => {
  if (!isOrbIndex(index)) return ""
  const name = obj[index]
  return `border-(--orb-bg-${name}) bg-(--orb-bg-${name})`
}
