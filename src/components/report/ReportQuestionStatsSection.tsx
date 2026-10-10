"use client"

import { useState, type CSSProperties } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp } from "lucide-react"

import Skeleton from "@/components/ui/skeleton"
import PickaxeIcon from "@/components/icons/PickaxeIcon"
import QuestionElementMark from "@/components/start/active/QuestionElementMark"
import { UserAvatarById, userProfileAdminSubtitle } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { questionElementVisual } from "@/lib/question-element"
import { formatQuizPoints, isNegativeQuizPoints, quizPointsToneClass } from "@/lib/quiz-points"
import { useUserByTgId } from "@/queries/user"
import {
  getReportQuestionsOutcomeStats,
  type IAnswerUserEntry,
  type IQuestionOutcomeStat,
} from "@/api/reports"

const STATS_SEAL_VARS = {
  "--seal-size": "1.35rem",
  "--seal-air": "3px",
  "--seal-stroke": "1.5px",
  "--seal-center": "calc(var(--seal-size) / 2 - var(--seal-size) / 3)",
  "--seal-notch": "calc(var(--seal-size) / 2 + var(--seal-air) + var(--seal-stroke))",
} as CSSProperties

function OutcomeUserRow({ entry, viewerTgId }: { entry: IAnswerUserEntry; viewerTgId: number }) {
  const telegramId = entry.telegram_id
  const score = entry.score
  const { data, isLoading } = useUserByTgId(telegramId, { enabled: !!telegramId && !!viewerTgId })
  const pseudo = data?.pseudo?.trim() || `Игрок ${telegramId}`
  const telegramLabel = userProfileAdminSubtitle(data)
  const title = telegramLabel ? `${pseudo} · ${telegramLabel}` : pseudo
  const negativeScore = isNegativeQuizPoints(score)

  return (
    <li className="flex w-full min-w-0 items-center gap-2 rounded-md px-1 py-0.5">
      <UserAvatarById
        telegramId={telegramId}
        viewerTgId={viewerTgId}
        variant="report"
        bare
        wrapperClassName="shrink-0"
        pseudoFallback={() => pseudo}
        className="border-white/25"
        loading={<Skeleton className="size-8 shrink-0 rounded-full border border-white/15" />}
        loadingClassName="size-8"
      />
      {isLoading ? (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Skeleton className="h-3.5 w-24 rounded-md bg-white/15" />
        </div>
      ) : (
        <>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5" title={title}>
            <span className="truncate text-sm font-medium text-white/90">{pseudo}</span>
            {telegramLabel ? <span className="truncate text-[0.65rem] leading-tight text-white/55">{telegramLabel}</span> : null}
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums",
              negativeScore ? "border-rose-400/35 bg-rose-500/15 text-rose-100" : "border-white/15 bg-white/8 text-white/90",
            )}
            title={`Очки за вопрос: ${formatQuizPoints(score)}`}
          >
            <span className={quizPointsToneClass(score, "text-white/90", "text-rose-100")}>{formatQuizPoints(score)}</span>
            <PickaxeIcon points={score} className="size-2.5 shrink-0" />
          </span>
        </>
      )}
    </li>
  )
}

function OutcomeUsersBlock({
  label,
  toneClass,
  users,
  viewerTgId,
}: {
  label: string
  toneClass: string
  users: IAnswerUserEntry[]
  viewerTgId: number
}) {
  return (
    <div className="space-y-1.5">
      <p className={cn("text-[0.65rem] font-semibold tracking-[0.12em] uppercase", toneClass)}>
        {label}
        <span className="ml-1.5 font-mono text-white/40 normal-case tracking-normal">{users.length}</span>
      </p>
      {users.length > 0 ? (
        <ul className="space-y-0.5">
          {users.map((entry) => (
            <OutcomeUserRow key={`${label}-${entry.telegram_id}`} entry={entry} viewerTgId={viewerTgId} />
          ))}
        </ul>
      ) : (
        <p className="px-1 text-xs text-white/35">Никого</p>
      )}
    </div>
  )
}

function QuestionStatCard({ row, tgId }: { row: IQuestionOutcomeStat; tgId: number }) {
  const [open, setOpen] = useState(false)
  const title = row.title?.trim()
  const hasElement = questionElementVisual(row.element) != null
  const displayTitle = title || `Вопрос ${row.index + 1}`

  return (
    <article
      className={cn(
        "relative overflow-visible rounded-xl border border-white/10 bg-white/4",
        hasElement && "pt-1",
      )}
      style={hasElement ? STATS_SEAL_VARS : undefined}
    >
      {hasElement ? (
        <>
          <QuestionElementMark element={row.element} variant="stamp" part="wash" />
          <QuestionElementMark element={row.element} variant="stamp" part="stamp" />
        </>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative z-1 flex w-full flex-col gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/4",
          hasElement && "pt-3.5 pl-3.5",
          open && "rounded-t-xl",
          !open && "rounded-xl",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium tracking-[0.14em] text-white/40 uppercase">Вопрос {row.index + 1}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-white/90" title={displayTitle}>
              {displayTitle}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="font-mono text-[0.65rem] text-white/40 tabular-nums">{row.participants_total} уч.</span>
            {open ? <ChevronUp className="size-4 text-white/55" aria-hidden /> : <ChevronDown className="size-4 text-white/55" aria-hidden />}
          </span>
        </div>
        <div
          className="flex h-2 overflow-hidden rounded-full bg-white/8"
          role="img"
          aria-label={`Верно ${row.right_pct}%, неверно ${row.wrong_pct}%, пропуск ${row.abstained_pct}%`}
        >
          {row.right_pct > 0 ? <span className="bg-emerald-400/80" style={{ width: `${row.right_pct}%` }} /> : null}
          {row.wrong_pct > 0 ? <span className="bg-rose-400/80" style={{ width: `${row.wrong_pct}%` }} /> : null}
          {row.abstained_pct > 0 ? <span className="bg-slate-400/70" style={{ width: `${row.abstained_pct}%` }} /> : null}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] tabular-nums">
          <span className="text-emerald-300/90">
            Верно <span className="font-semibold">{row.right_pct}%</span>
            <span className="text-white/35"> · {row.right.count}</span>
          </span>
          <span className="text-rose-300/90">
            Неверно <span className="font-semibold">{row.wrong_pct}%</span>
            <span className="text-white/35"> · {row.wrong.count}</span>
          </span>
          <span className="text-slate-300/85">
            Пропуск <span className="font-semibold">{row.abstained_pct}%</span>
            <span className="text-white/35"> · {row.abstained.count}</span>
          </span>
        </div>
      </button>
      {open ? (
        <div className="relative z-1 space-y-3 border-t border-white/8 px-3 pt-3 pb-3" role="region" aria-label={`Участники: ${displayTitle}`}>
          <OutcomeUsersBlock label="Верно" toneClass="text-emerald-300/90" users={row.right.users ?? []} viewerTgId={tgId} />
          <OutcomeUsersBlock label="Неверно" toneClass="text-rose-300/90" users={row.wrong.users ?? []} viewerTgId={tgId} />
          <OutcomeUsersBlock label="Пропуск" toneClass="text-slate-300/85" users={row.abstained.users ?? []} viewerTgId={tgId} />
        </div>
      ) : null}
    </article>
  )
}

export default function ReportQuestionStatsSection({
  reportId,
  tgId,
  enabled,
}: {
  reportId: string
  tgId?: number
  enabled: boolean
}) {
  const [sectionOpen, setSectionOpen] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["report-questions-outcome-stats", reportId],
    queryFn: () => getReportQuestionsOutcomeStats(reportId),
    enabled: enabled && !!reportId && !!tgId,
  })

  const questions = data?.questions ?? []

  if (!enabled) return null

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/3 p-3.5 sm:p-4">
        <Skeleton className="mb-3 h-5 w-40 rounded-md" />
        <div className="space-y-2.5">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={`q-stat-skeleton-${index}`} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/3 p-3.5 sm:p-4">
        <p className="text-sm text-rose-300/90">
          {error instanceof Error ? error.message : "Не удалось загрузить статистику по вопросам"}
        </p>
      </section>
    )
  }

  if (questions.length === 0) return null

  return (
    <section className="overflow-visible rounded-2xl border border-white/10 bg-white/3 p-3.5 sm:p-4">
      <button
        type="button"
        aria-expanded={sectionOpen}
        onClick={() => setSectionOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-0.5 py-0.5 text-left transition-colors hover:bg-white/4"
      >
        <div>
          <h2 className="text-base font-semibold text-white">По вопросам</h2>
          <p className="mt-0.5 text-xs text-white/45">
            {sectionOpen
              ? "Доля верных, неверных и пропусков · нажмите вопрос для списка игроков"
              : `${questions.length} закрытых · нажмите, чтобы раскрыть`}
          </p>
        </div>
        {sectionOpen ? (
          <ChevronUp className="size-4 shrink-0 text-white/55" aria-hidden />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-white/55" aria-hidden />
        )}
      </button>

      {sectionOpen ? (
        <ul className="mt-3 space-y-3 overflow-visible pt-1" aria-label="Статистика по вопросам">
          {questions.map((row) => (
            <li key={`question-stat-${row.index}-${row.question_id}`} className="overflow-visible">
              <QuestionStatCard row={row} tgId={tgId!} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
