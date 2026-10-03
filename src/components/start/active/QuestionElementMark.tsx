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
          role="img"
          title={hint}
          aria-label={hint}
          className={cn(
            "absolute top-3 left-3 z-10 flex size-8 items-center justify-center rounded-full border",
            resonant && "motion-safe:animate-pulse",
            className,
          )}
          style={{
            borderColor: visual.accentColor,
            backgroundColor: `color-mix(in srgb, ${visual.accentColor} 16%, transparent)`,
            boxShadow: resonant
              ? `0 0 0 2px color-mix(in srgb, ${visual.accentColor} 70%, transparent), 0 0 14px color-mix(in srgb, ${visual.accentColor} 55%, transparent)`
              : `0 0 10px color-mix(in srgb, ${visual.accentColor} 28%, transparent)`,
          }}
        >
          <Image src={visual.iconSrc} alt="" width={18} height={18} className="size-4.5 object-contain" />
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
