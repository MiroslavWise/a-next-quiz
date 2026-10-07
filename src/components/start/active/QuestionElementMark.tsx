import Image from "next/image"

import { cn } from "@/lib/utils"
import { questionElementHint, questionElementVisual } from "@/lib/question-element"

interface IProps {
  element?: unknown
  /** Стихия профиля совпала с меткой, игрок не аватар. */
  resonant?: boolean
  variant?: "stamp" | "badge"
  className?: string
}

function QuestionElementWash({ accent, resonant }: { accent: string; resonant: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        background: `radial-gradient(ellipse 78% 62% at 0% 0%, color-mix(in srgb, ${accent} ${resonant ? 28 : 16}%, transparent), transparent 72%)`,
      }}
    />
  )
}

function QuestionElementMark({ element, resonant = false, variant = "badge", className }: IProps) {
  const visual = questionElementVisual(element)
  if (!visual) return null

  const hint = questionElementHint(visual.id)

  if (variant === "stamp") {
    return (
      <>
        <QuestionElementWash accent={visual.accentColor} resonant={resonant} />
        <span
          className={cn(
            "pointer-events-none absolute z-20 size-(--seal-size)",
            resonant && "motion-safe:animate-pulse",
            className,
          )}
          style={{ left: "var(--seal-center)", top: "var(--seal-center)", transform: "translate(-50%, -50%)" }}
        >
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 size-(--seal-orbit) -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{ borderColor: visual.accentColor }}
          />
          <span
            role="img"
            title={hint}
            aria-label={hint}
            className="relative flex size-8 items-center justify-center rounded-full border bg-[#06141a]"
            style={{
              borderColor: visual.accentColor,
              backgroundColor: `color-mix(in srgb, ${visual.accentColor} 24%, #06141a)`,
              boxShadow: `0 0 0 1px ${visual.accentColor}, 0 0 16px color-mix(in srgb, ${visual.accentColor} 50%, transparent)`,
            }}
          >
            <Image src={visual.iconSrc} alt="" width={18} height={18} className="size-4.5 object-contain" />
          </span>
        </span>
      </>
    )
  }

  return (
    <span
      title={hint}
      aria-label={hint}
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-2 text-[0.65rem] font-medium text-current",
        className,
      )}
      style={{
        borderColor: `color-mix(in srgb, ${visual.accentColor} 55%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${visual.accentColor} 14%, transparent)`,
      }}
    >
      <Image src={visual.iconSrc} alt="" width={12} height={12} className="size-2.5 object-contain" />
      {visual.label}
    </span>
  )
}

QuestionElementMark.displayName = "QuestionElementMark"
export default QuestionElementMark
