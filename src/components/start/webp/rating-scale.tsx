import { cn } from "@/lib/utils"

interface IProps {
  isUp?: boolean
  className?: string
}

function RatingScale({ isUp, className }: IProps) {
  if (typeof isUp !== "boolean") return null

  return (
    <span className={cn("pointer-events-none relative overflow-hidden", className)}>
      <img
        src={isUp ? "/webp/up-rate.webp" : "/webp/down-rate.webp"}
        alt={isUp ? "Вверх" : "Вниз"}
        className="size-full object-cover"
        draggable={false}
      />
    </span>
  )
}

RatingScale.displayName = "RatingScale"
export default RatingScale
