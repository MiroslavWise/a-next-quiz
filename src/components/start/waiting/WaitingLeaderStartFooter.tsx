import Spinner from "@/components/ui/spinner"

import { cn } from "@/lib/utils"
import { PHASE_FOOTER_CLASS, PHASE_FOOTER_PRIMARY_CLASS } from "@/components/start/lib/phase-shell"

export interface WaitingLeaderStartFooterProps {
  onStart: () => void
  loading: boolean
  /** Запретить старт (например, пока игроков меньше двух). */
  disabled?: boolean
  /** Пояснение под кнопкой, почему старт сейчас недоступен. */
  hint?: string
}

export default function WaitingLeaderStartFooter({ onStart, loading, disabled = false, hint }: WaitingLeaderStartFooterProps) {
  return (
    <footer className={PHASE_FOOTER_CLASS}>
      <button
        type="button"
        className={cn(PHASE_FOOTER_PRIMARY_CLASS, "disabled:cursor-not-allowed disabled:opacity-50")}
        onClick={onStart}
        disabled={loading || disabled}
      >
        {loading ? <Spinner className="size-4" /> : "Проверить готовность"}
      </button>
      {disabled && hint ? <p className="mt-2 text-center text-xs text-white/55">{hint}</p> : null}
    </footer>
  )
}
