import type { CSSProperties, HTMLAttributes } from "react"

import Skeleton from "@/components/ui/skeleton"
import { UserAvatarById } from "@/components/common/UserAvatar"

import { cn } from "@/lib/utils"
import { useAnswerOrderBy } from "../../hooks/use-answer-order-by"

import styles from "../../styles/optimal.module.scss"

export const footerActionSlotClass: HTMLAttributes<HTMLDivElement>["className"] =
  "glass-start-btn-primary-palette flex h-fit w-full shrink-0 items-center justify-center rounded-2xl px-4 min-h-15"

export interface AnswersCollectionProgressProps {
  answeredCount: number
  participantsTotal: number
  answers: number[]
  users: number[]
}

export default function AnswersCollectionProgress({ answeredCount, participantsTotal, users, answers }: AnswersCollectionProgressProps) {
  const answerOrderByTelegramId = useAnswerOrderBy(answers)

  return (
    <div
      className={cn(
        "relative h-15 w-full justify-center gap-1.5 rounded-2xl px-4",
        "glass-start-slab",
        styles.progressbar,
        "after:bg-inherit after:text-right after:text-xs after:text-white",
      )}
      role="progressbar"
      aria-valuenow={answeredCount}
      aria-valuemin={0}
      aria-valuemax={participantsTotal}
      aria-label={`Ответов: ${answeredCount} из ${participantsTotal}`}
      data-answer={`Ответов: ${answeredCount} из ${participantsTotal}`}
    >
      {users.length > 0 ? (
        <div className="relative z-20 -mx-4 w-[calc(100%+2rem)]">
          <div className="mx-auto flex touch-pan-x snap-x snap-mandatory flex-row items-center overflow-x-auto px-4 py-2">
            {users.map((user, index) => (
              <UserAvatar
                key={user + "::" + index}
                index={index}
                user={user}
                length={users.length}
                answerOrder={Number.isFinite(user) ? answerOrderByTelegramId.get(user) : undefined}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-center text-sm whitespace-nowrap text-white">Нет игроков</span>
        </div>
      )}
    </div>
  )
}

function UserAvatar({ index, user, length, answerOrder }: { index: number; user: number; length: number; answerOrder?: number }) {
  return (
    <div
      className={cn(
        "relative shrink-0 snap-start transition-[filter] duration-700 ease-in-out",
        !!answerOrder && answerOrder > 0 ? "grayscale-0" : "grayscale",
      )}
      style={
        {
          marginLeft: index === 0 ? 0 : "-0.625rem",
          zIndex: 20 + length - index,
        } as CSSProperties
      }
    >
      {!!answerOrder && answerOrder > 0 && (
        <span
          className="pointer-events-none absolute -bottom-0.5 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full bg-black/75 text-center font-mono text-xs leading-none font-normal whitespace-nowrap text-white tabular-nums"
          style={{
            zIndex: 21 + length - index,
          }}
        >
          {answerOrder}
        </span>
      )}
      <UserAvatarById
        telegramId={typeof user === "string" ? Number(user) : user}
        viewerTgId={user}
        variant="footer"
        bare
        className="transition-transform duration-200"
        loading={<Skeleton className="size-10 shrink-0 rounded-full" />}
      />
    </div>
  )
}
