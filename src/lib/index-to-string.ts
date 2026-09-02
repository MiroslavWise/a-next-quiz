export const indexToString = (index: number) => {
  if (index === 0) return "border-(--orb-bg-one) bg-(--orb-bg-one)"
  if (index === 1) return "border-(--orb-bg-two) bg-(--orb-bg-two)"
  if (index === 2) return "border-(--orb-bg-three) bg-(--orb-bg-three)"
  if (index === 3) return "border-(--orb-bg-four) bg-(--orb-bg-four)"
  return "border-(--orb-bg-one) bg-(--orb-bg-one)"
}
