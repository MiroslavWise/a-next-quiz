"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Medal,
  Trophy,
  Gamepad2,
  HelpCircle,
} from "lucide-react";

import Skeleton from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import PickaxeIcon from "@/components/lottie/PickaxeIcon";
import {
  getMyGameResult,
  getMyGames,
  type IMyGameResultQuestion,
} from "@/api/reports";
import { formatDateTimeLongRu } from "@/lib/date";
import { cn } from "@/lib/utils";

function getRankLabel(rank: number) {
  if (rank === 1)
    return { icon: Trophy, label: "1 место", color: "text-amber-300" };
  if (rank === 2)
    return { icon: Medal, label: "2 место", color: "text-slate-200" };
  if (rank === 3)
    return { icon: Medal, label: "3 место", color: "text-orange-300" };
  return { icon: Award, label: `${rank} место`, color: "text-white/50" };
}

function QuestionRow({
  q,
  index,
}: {
  q: IMyGameResultQuestion;
  index: number;
}) {
  const isRight = q.is_right === true;
  const isWrong = q.is_right === false && q.answered;
  const isSkipped = !q.answered;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-3.5 py-3 transition-colors",
        isRight ? "bg-emerald-500/8" : isWrong ? "bg-red-500/8" : "bg-white/4",
      )}
    >
      {/* Status icon */}
      <div className="mt-0.5 shrink-0">
        {isRight ? (
          <CheckCircle2 className="size-4 text-emerald-400" />
        ) : isWrong ? (
          <XCircle className="size-4 text-red-400" />
        ) : (
          <MinusCircle className="size-4 text-white/25" />
        )}
      </div>

      {/* Question text */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-3 text-sm leading-snug text-white/80">
          {q.title ?? `Вопрос ${index + 1}`}
        </p>
        {q.element_effects && q.element_effects.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {q.element_effects.map((eff, i) => (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  eff.points >= 0
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400",
                )}
              >
                {eff.points >= 0 ? "+" : ""}
                {eff.points} {eff.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Points */}
      <div className="shrink-0">
        <span
          className={cn(
            "inline-grid grid-cols-[minmax(0,1fr)_0.75rem] items-center gap-1 text-sm font-semibold tabular-nums",
            isRight
              ? "text-emerald-400"
              : isWrong
                ? "text-red-400"
                : "text-white/25",
          )}
        >
          <span>
            {q.points > 0 ? "+" : ""}
            {q.points}
          </span>
          <PickaxeIcon points={q.points} className="size-3 shrink-0" />
        </span>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 px-4 py-6">
      <Skeleton className="h-8 w-48 bg-white/8" />
      <Skeleton className="h-40 w-full rounded-2xl bg-white/6" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export default function MyGameResultPage() {
  const params = useParams() as Record<string, string | string[] | undefined>;
  const reportId = typeof params.reportId === "string" ? params.reportId : Array.isArray(params.reportId) ? params.reportId[0] : undefined;

  const {
    data: result,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-game-result", reportId],
    queryFn: () => getMyGameResult(reportId!),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: myGames } = useQuery({
    queryKey: ["my-games"],
    queryFn: getMyGames,
    staleTime: 1000 * 60 * 2,
  });

  const gameEntry = myGames?.find((g) => String(g.id) === String(reportId));

  if (isLoading) {
    return (
      <main className="text-foreground flex h-full w-full flex-col items-center overflow-y-auto px-0">
        <PageSkeleton />
      </main>
    );
  }

  if (isError || !result) {
    return (
      <main className="text-foreground flex h-full w-full flex-col items-center px-0">
        <div className="flex w-full flex-col items-center gap-4 px-4 py-12">
          <HelpCircle className="size-12 text-white/20" />
          <p className="text-center text-sm text-white/40">
            Не удалось загрузить результат игры
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="size-3.5" />
              На главную
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const rank = getRankLabel(result.rank);
  const RankIcon = rank.icon;
  const imageUrl = result.quiz?.image_url ?? gameEntry?.quiz?.imageUrl ?? null;
  const quizName = result.quiz?.name ?? gameEntry?.quiz?.name ?? "Квиз";
  const quizDescription = result.quiz?.description ?? "";
  const createdAt = gameEntry?.created_at;
  const rightCount = result.questions.filter((q) => q.is_right === true).length;
  const totalCount = result.questions.length;

  return (
    <main className="text-foreground flex h-full w-full flex-col items-center overflow-y-auto px-0">
      <section className="container mx-auto flex w-full max-w-2xl flex-col gap-0 px-4 pb-10 pt-10">
        {/* Back button */}
        <Link
          href="/"
          className="mb-4 inline-flex w-fit items-center gap-3 rounded-xl px-1 py-1 text-sm text-white/40 transition-colors hover:text-white/70"
          aria-label="Назад на главную"
        >
          <Button
            variant="ghost"
            size="icon-sm"
            aria-hidden
            tabIndex={-1}
            className="pointer-events-none"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <span>История игр</span>
        </Link>

        {/* Hero card */}
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {/* Quiz cover */}
          {imageUrl && (
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={imageUrl}
                alt={quizName}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          )}

          {/* Info block */}
          <div
            className={cn(
              "relative flex flex-col gap-2.5 p-4",
              imageUrl ? "-mt-10" : "",
            )}
          >
            {/* Quiz icon if no image */}
            {!imageUrl && (
              <div className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/8">
                <Gamepad2 className="size-7 text-white/40" />
              </div>
            )}

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold leading-tight text-white">
                {quizName}
              </h2>
              {quizDescription && (
                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-white/50">
                  {quizDescription}
                </p>
              )}
              {createdAt && (
                <p className="mt-1 text-xs text-white/30">
                  {formatDateTimeLongRu(createdAt)}
                </p>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {/* Rank */}
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/8 bg-white/5 py-2.5">
                <RankIcon className={cn("size-5", rank.color)} aria-hidden />
                <span
                  className={cn("text-sm font-bold tabular-nums", rank.color)}
                >
                  {rank.label}
                </span>
                <span className="text-[10px] text-white/30">Место</span>
              </div>

              {/* Points */}
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/8 bg-white/5 py-2.5">
                <PickaxeIcon points={result.total_points} className="size-5" />
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    result.total_points >= 0 ? "text-white/90" : "text-red-400",
                  )}
                >
                  {result.total_points}
                </span>
                <span className="text-[10px] text-white/30">Очков</span>
              </div>

              {/* Correct */}
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/8 bg-white/5 py-2.5">
                <Medal className="size-5 text-emerald-400/70" />
                <span className="text-sm font-bold tabular-nums text-white/90">
                  {rightCount}/{totalCount}
                </span>
                <span className="text-[10px] text-white/30">Верно</span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions list */}
        {result.questions.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="mb-2 px-1 text-xs font-medium tracking-wide text-white/30 uppercase">
              Вопросы
            </p>
            {result.questions.map((q, i) => (
              <QuestionRow key={q.question_id ?? i} q={q} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
