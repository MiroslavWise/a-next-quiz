import Spinner from "@/components/ui/spinner"

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
    <footer className="bottom-next from-background via-background/92 fixed right-0 left-0 z-50 shrink-0 bg-linear-to-t to-transparent p-4 pt-8 backdrop-blur-[2px] sm:p-5 sm:pt-10 xl:absolute xl:-bottom-12 xl:-left-4 xl:bg-none xl:pt-4 xl:backdrop-blur-none">
      <button
        type="button"
        className="glass-start-btn-primary-palette flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onStart}
        disabled={loading || disabled}
      >
        {loading ? <Spinner className="size-4" /> : "Проверить готовность"}
      </button>
      {disabled && hint ? <p className="mt-2 text-center text-xs text-white/55">{hint}</p> : null}
    </footer>
  )
}
