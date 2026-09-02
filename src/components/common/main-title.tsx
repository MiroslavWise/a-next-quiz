import { memo } from "react"

import Title, { ETitle } from "@/assets/title"

const TITLE_ITEMS = [
  { letter: ETitle.Q, color: "var(--orb-bg-one)" },
  { letter: ETitle.A, color: "var(--orb-bg-two)" },
  { letter: ETitle.N, color: "var(--orb-bg-three)" },
  { letter: ETitle.D, color: "var(--orb-bg-four)" },
] as const

function MainTitle() {
  return (
    <div className="grid w-full grid-cols-4 gap-2" aria-label="QAND">
      {TITLE_ITEMS.map(({ letter, color }) => (
        <Title key={letter} title={letter} color={color} />
      ))}
    </div>
  )
}

MainTitle.displayName = "MainTitle"

export default memo(MainTitle)
