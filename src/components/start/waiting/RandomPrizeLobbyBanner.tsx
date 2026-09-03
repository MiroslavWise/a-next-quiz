import { Sparkles } from "lucide-react"

import PrizeLottie from "@/components/lottie/PrizeLottie"

import { RANDOM_PRIZE_MIN_CORRECT_PERCENT } from "@/lib/report-prizes"

function RandomPrizeLobbyBanner() {
  return (
    <section
      className="glass-start-liquid-palette w-full max-w-[calc(100vw-2rem)] shrink-0 rounded-2xl p-3 sm:p-4"
      aria-label="Случайный приз"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-(--accent-orb)/40 bg-(--accent-orb)/12 sm:size-11"
          aria-hidden
        >
          <PrizeLottie className="size-6" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-white sm:text-[0.95rem]">Случайный приз</h2>
            <Sparkles className="size-3.5 shrink-0 text-(--accent-orb)" aria-hidden />
          </div>
          <p className="text-[0.68rem] leading-snug text-white/60 sm:text-xs">
            После игры среди участников,{" "}
            <strong className="font-medium text-white/82">не занявших призовые места</strong> в рейтинге и ответивших
            верно{" "}
            <strong className="font-medium text-white/82">
              минимум на {RANDOM_PRIZE_MIN_CORRECT_PERCENT}% вопросов
            </strong>
            , случайно выбирается ещё один победитель.
          </p>
        </div>
      </div>
    </section>
  )
}

RandomPrizeLobbyBanner.displayName = "RandomPrizeLobbyBanner"
export default RandomPrizeLobbyBanner
