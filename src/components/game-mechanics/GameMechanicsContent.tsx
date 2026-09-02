import type { CSSProperties, PropsWithChildren, ReactNode } from "react"
import { Brain, Clock, Crown, Gift, ListChecks, Sparkles, Target, Trophy, Users, Zap } from "lucide-react"

import AppPageHeaders from "@/components/common/AppPageHeaders"

import { GAME_SKILLS, type GameSkillDefinition } from "@/enum/game-skill"
import { GAME_AVATAR_CARD, GAME_ELEMENT_CARDS, type GameElementCard } from "@/lib/game-elements-catalog"
import { GameSkillIcon } from "@/lib/game-skill-icons"
import { RANDOM_PRIZE_MIN_CORRECT_PERCENT } from "@/lib/report-prizes"
import { cn } from "@/lib/utils"
import {
  CHECKING_WINDOW_SECONDS,
  LUCKY_BONUS_PERCENT,
  START_SPLASH_SECONDS,
  STREAK_BONUS_MAX_PERCENT,
  STREAK_BONUS_STEP_PERCENT,
  STREAK_TIER_DEFINITIONS,
  streakBonusPercent,
} from "@/lib/game-streak-tiers"
import {
  ALL_ELEMENTS_BOOST_COMPARISON,
  PROGRESSIVE_BONUS_SCALE,
  QUESTION_BONUS_OPTIONS,
  SEQUENTIAL_ORDER_BONUS_EXAMPLE,
  QUESTION_BONUSES_AT_END,
  QUESTION_BONUSES_ON_ANSWER,
  getQuestionBonusLabel,
  isNegativeQuestionBonus,
  type QuestionBonus,
} from "@/enum/question-bonus"
import { QuestionBonusIcon } from "@/lib/question-bonus-icons"

function MechanicsSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h3 className="text-foreground text-base font-semibold tracking-tight">{title}</h3>
      <div className="text-muted-foreground flex min-w-0 flex-col gap-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

/** Иконка + текст: весь текст в одном блоке, иначе flex разложит <strong> и фрагменты по горизонтали. */
function IconNote({ icon, children, className }: PropsWithChildren<{ icon: ReactNode; className?: string }>) {
  return (
    <p className={cn("flex min-w-0 items-start gap-2", className)}>
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 text-pretty">{children}</span>
    </p>
  )
}

function PhaseCard({ phase, title, description }: { phase: string; title: string; description: string }) {
  return (
    <div className="border-border bg-background rounded-xl border p-4">
      <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
        <span className="shrink-0 rounded-md border border-white/15 bg-white/8 px-2 py-0.5 font-mono text-[0.65rem] font-semibold tracking-wider text-white/70 uppercase">
          {phase}
        </span>
        <span className="text-foreground min-w-0 text-sm font-semibold">{title}</span>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </div>
  )
}

function SkillMechanicsCard({ skill }: { skill: GameSkillDefinition }) {
  return (
    <article className="border-border bg-background flex min-w-0 flex-col rounded-xl border p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-(--accent-orb)/40 bg-(--accent-orb)/12 text-(--accent-orb)">
          <GameSkillIcon skillId={skill.id} className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-foreground text-sm font-semibold">{skill.title}</h4>
            <code className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.6rem] tracking-wide text-white/45">
              {skill.id}
            </code>
          </div>
          <p className="mt-0.5 text-xs font-medium text-(--accent-orb)">{skill.short}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-white/70">{skill.detail}</p>
      {skill.condition ? (
        <p className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-white/60">
          {skill.condition}
        </p>
      ) : null}
    </article>
  )
}

function StreakTierCard({
  title,
  badgeText,
  rangeLabel,
  bonusPercent,
  containerClass,
  titleClass,
  badgeClass,
  pulse,
}: {
  title: string
  badgeText: string
  rangeLabel: string
  bonusPercent: number
  containerClass: string
  titleClass: string
  badgeClass: string
  pulse: boolean
}) {
  return (
    <li className={cn("rounded-xl border px-4 py-3", containerClass)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("text-xs font-semibold tracking-[0.16em] uppercase", titleClass)}>{title}</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.14em]",
                badgeClass,
              )}
            >
              {badgeText}
            </span>
            {pulse ? <span className="text-[0.65rem] font-medium tracking-wide text-white/50 uppercase">свечение</span> : null}
          </div>
          <p className="mt-1 text-xs text-white/65">{rangeLabel}</p>
        </div>
        {bonusPercent > 0 ? <span className="shrink-0 text-sm font-bold text-white/90 tabular-nums">+{bonusPercent}%</span> : null}
      </div>
    </li>
  )
}

function ElementEffectList({
  title,
  effects,
  variant,
  accentColor,
}: {
  title: string
  effects: GameElementCard["bonuses"]
  variant: "bonus" | "penalty"
  accentColor: string
}) {
  if (effects.length === 0) {
    return null
  }

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[0.65rem] font-semibold tracking-[0.14em] text-white/50 uppercase">{title}</p>
      <ul className="flex min-w-0 flex-col gap-1.5">
        {effects.map((effect) => (
          <li
            key={effect.id}
            className={cn(
              "rounded-lg border px-2.5 py-2",
              variant === "bonus" ? "border-white/10 bg-white/5" : "border-red-400/20 bg-red-500/8",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
              <span className="text-xs font-semibold" style={{ color: variant === "bonus" ? accentColor : "#fca5a5" }}>
                {effect.title}
              </span>
              <span className="text-[0.65rem] font-medium tracking-wide text-white/55 tabular-nums">{effect.short}</span>
            </div>
            <p className="mt-0.5 text-[0.7rem] leading-snug text-white/60">{effect.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function QuestionBonusTimingGroup({
  title,
  description,
  bonuses,
}: {
  title: string
  description: string
  bonuses: readonly QuestionBonus[]
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/12 bg-white/5 px-4 py-3">
      <p className="text-sm font-semibold text-white/90">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/60">{description}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {bonuses.map((bonus) => {
          const negative = isNegativeQuestionBonus(bonus)

          return (
            <li
              key={bonus}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium",
                negative
                  ? "border-(--unfaithful)/40 bg-(--unfaithful)/10 text-rose-50"
                  : "border-(--accent-orb)/40 bg-(--accent-orb)/10 text-amber-50",
              )}
            >
              <QuestionBonusIcon bonus={bonus} className="size-3 shrink-0 opacity-90" />
              {getQuestionBonusLabel(bonus)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AllElementsBoostTable() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-xl border border-(--accent-orb)/30 bg-(--accent-orb)/6">
      <table className="w-full min-w-136 border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-white/10 text-[0.65rem] tracking-[0.12em] text-white/50 uppercase">
            <th className="px-3 py-2.5 font-semibold">Стихия</th>
            <th className="px-3 py-2.5 font-semibold">Обычно</th>
            <th className="px-3 py-2.5 font-semibold">С ALL_ELEMENTS_BOOST</th>
          </tr>
        </thead>
        <tbody>
          {ALL_ELEMENTS_BOOST_COMPARISON.map((row) => (
            <tr key={row.name} className="border-b border-white/8 last:border-b-0">
              <td className="px-3 py-2.5 align-top">
                <span className="inline-flex items-center gap-2 font-semibold" style={{ color: row.accentColor }}>
                  <img src={row.iconSrc} alt="" className="size-5 object-contain" width={20} height={20} />
                  {row.name}
                </span>
              </td>
              <td className="px-3 py-2.5 align-top leading-relaxed text-white/70">{row.normal}</td>
              <td className="px-3 py-2.5 align-top leading-relaxed text-white/85">{row.boosted}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-white/10 px-3 py-2 text-[0.68rem] leading-relaxed text-white/55">
        Эффекты в API — те же id (<code className="text-[0.65rem]">fire_speed</code>, <code className="text-[0.65rem]">earth_patience</code>
        , <code className="text-[0.65rem]">air_gust_double</code> и т.д.), меняются только числа. Аватар игры и игроки без стихии — без
        изменений.
      </p>
    </div>
  )
}

function ProgressiveBonusTable() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-xl border border-(--accent-orb)/30 bg-(--accent-orb)/6">
      <table className="w-full min-w-64 border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-white/10 text-[0.65rem] tracking-[0.12em] text-white/50 uppercase">
            <th className="px-3 py-2.5 font-semibold">Место в очереди верных</th>
            <th className="px-3 py-2.5 font-semibold">Бонус</th>
          </tr>
        </thead>
        <tbody>
          {PROGRESSIVE_BONUS_SCALE.map((row) => (
            <tr key={row.positionLabel} className="border-b border-white/8 last:border-b-0">
              <td className="px-3 py-2.5 text-white/80">{row.positionLabel}</td>
              <td className="px-3 py-2.5 font-semibold text-(--accent-orb) tabular-nums">+{row.percent}% от счёта за ответ</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-white/10 px-3 py-2 text-[0.68rem] leading-relaxed text-white/55">
        Далее +2% за каждого следующего верного (7-й → +15%, 8-й → +17% …). Очередь:{" "}
        <code className="text-[0.65rem]">priorCorrect + 1</code> — неверные ответы до вас не сдвигают место. Только верный ответ; effect id:{" "}
        <code className="text-[0.65rem]">q_progressive_bonus</code>.
      </p>
    </div>
  )
}

function SequentialOrderBonusTable() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-xl border border-(--unfaithful)/30 bg-(--unfaithful)/6">
      <table className="w-full min-w-80 border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-white/10 text-[0.65rem] tracking-[0.12em] text-white/50 uppercase">
            <th className="px-3 py-2.5 font-semibold">Место среди верных</th>
            <th className="px-3 py-2.5 font-semibold">% от base</th>
            <th className="px-3 py-2.5 font-semibold">Очки (base 1000)</th>
          </tr>
        </thead>
        <tbody>
          {SEQUENTIAL_ORDER_BONUS_EXAMPLE.map((row) => (
            <tr key={row.positionLabel} className="border-b border-white/8 last:border-b-0">
              <td className="px-3 py-2.5 text-white/80">{row.positionLabel}</td>
              <td
                className={cn(
                  "px-3 py-2.5 font-semibold tabular-nums",
                  row.percent < 0 ? "text-unfaithful" : row.percent > 0 ? "text-(--accent-orb)" : "text-white/70",
                )}
              >
                {row.percent > 0 ? `+${row.percent}%` : `${row.percent}%`}
              </td>
              <td
                className={cn(
                  "px-3 py-2.5 font-semibold tabular-nums",
                  row.points < 0 ? "text-unfaithful" : row.points > 0 ? "text-(--accent-orb)" : "text-white/70",
                )}
              >
                {row.points > 0 ? `+${row.points}` : row.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-white/10 px-3 py-2 text-[0.68rem] leading-relaxed text-white/55">
        Пример при <strong className="font-medium text-white/75">N = 10</strong> игроков. Формула для i-го верного:{" "}
        <code className="text-[0.65rem]">−N + 2N·(i−1)/(N−1)</code> % от base. Шаг между местами —{" "}
        <code className="text-[0.65rem]">2N/(N−1)</code> %. Только верный ответ; effect id:{" "}
        <code className="text-[0.65rem]">q_sequential_order_bonus</code>.
      </p>
    </div>
  )
}

function ElementMechanicsCard({ card }: { card: GameElementCard }) {
  const isAvatar = card.id === "AVATAR"
  const accent = card.accentColor

  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur-sm",
        card.wide ? "md:p-5" : "h-full",
        isAvatar ? "border-white/25 bg-white/6" : "bg-black/20",
      )}
      style={
        {
          borderColor: isAvatar ? "rgb(255 255 255 / 0.22)" : `${accent}55`,
          boxShadow: isAvatar ? "0 0 40px rgb(255 255 255 / 0.06)" : `0 0 32px ${accent}22`,
          "--element-accent": accent,
        } as CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80"
        style={{
          background: isAvatar
            ? "linear-gradient(180deg, rgb(255 255 255 / 0.12) 0%, transparent 100%)"
            : `linear-gradient(180deg, ${accent}33 0%, transparent 100%)`,
        }}
        aria-hidden
      />

      <div className="relative flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-xl border p-2",
            isAvatar ? "border-white/20 bg-white/10" : "border-white/10 bg-black/30",
          )}
          style={isAvatar ? undefined : { borderColor: `${accent}66`, backgroundColor: `${accent}18` }}
        >
          <img src={card.iconSrc} alt="" className="size-10 object-contain" width={40} height={40} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold tracking-tight" style={{ color: isAvatar ? "#fff" : accent }}>
              {card.name}
            </h4>
            <span
              className="inline-flex rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold tracking-[0.12em] uppercase"
              style={{
                borderColor: isAvatar ? "rgb(255 255 255 / 0.25)" : `${accent}55`,
                color: isAvatar ? "rgb(255 255 255 / 0.85)" : accent,
                backgroundColor: isAvatar ? "rgb(255 255 255 / 0.08)" : `${accent}14`,
              }}
            >
              {card.tagline}
            </span>
          </div>
          <p className="mt-0.5 text-[0.7rem] font-medium text-white/50">{card.archetype}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/80">{card.description}</p>
        </div>
      </div>

      <blockquote
        className="relative mt-3 rounded-xl border px-3 py-2.5 text-xs leading-relaxed text-white/75 italic"
        style={{
          borderColor: isAvatar ? "rgb(255 255 255 / 0.15)" : `${accent}33`,
          backgroundColor: isAvatar ? "rgb(255 255 255 / 0.05)" : `${accent}0d`,
        }}
      >
        {card.uiHint}
      </blockquote>

      <div className={cn("relative mt-3 grid min-w-0 gap-3", card.penalties.length > 0 ? "sm:grid-cols-2" : "grid-cols-1")}>
        <ElementEffectList title="Бонусы" effects={card.bonuses} variant="bonus" accentColor={accent} />
        <ElementEffectList title="Штрафы" effects={card.penalties} variant="penalty" accentColor={accent} />
      </div>
    </article>
  )
}

export default function GameMechanicsContent() {
  return (
    <main className="text-foreground flex h-full w-full flex-col items-center px-0 lg:px-4">
      <section className="container mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-8">
        <div className="flex w-full min-w-0 flex-col pt-5 pb-24">
          <AppPageHeaders
            title="Механика игры"
            description="Как проходит викторина, очки и бонусы"
            toolbarTitle="Правила и бонусы"
            accent="four"
            backAriaLabel="На главную"
            toolbarClassName="mb-4"
          />

          <div className="flex min-w-0 flex-col gap-8">
            <MechanicsSection title="Как проходит игра">
              <p>
                Ведущий создаёт сессию отчёта по квизу и делится кодом подключения. Участники входят в лобби, затем игра проходит через
                несколько фаз — от ожидания до финальной таблицы.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <PhaseCard
                  phase="WAITING"
                  title="Лобби"
                  description="Участники подключаются по коду, ведущий настраивает призовые места. Можно отправлять эмоции в комнату. Ведущий не числится в списке игроков."
                />
                <PhaseCard
                  phase="CHECKING"
                  title={`Подтверждение участия (${CHECKING_WINDOW_SECONDS} с)`}
                  description={`Ведущий запускает игру — открывается окно «Участвую» на ${CHECKING_WINDOW_SECONDS} секунд. Не подтвердившие удаляются из игры. Наблюдатели подтверждать не должны.`}
                />
                <PhaseCard
                  phase="START"
                  title={`Экран старта (${START_SPLASH_SECONDS} с)`}
                  description="Короткая заставка «Игра начинается» перед первым вопросом."
                />
                <PhaseCard
                  phase="GAME"
                  title="Вопросы"
                  description="У каждого вопроса свой таймер и базовые очки. На активный вопрос можно ответить один раз. Ведущий переключает вопросы; по таймеру вопрос закрывается автоматически."
                />
                <PhaseCard
                  phase="END"
                  title="Финиш"
                  description={`Показывается итоговая таблица и подиум. Сервер выбирает случайного призёра среди игроков вне настроенных призовых мест, ответивших верно минимум на ${RANDOM_PRIZE_MIN_CORRECT_PERCENT}% вопросов; всем призёрам уходит поздравление в Telegram-бота.`}
                />
              </div>
            </MechanicsSection>

            <MechanicsSection title="Роли в игре">
              <ul className="space-y-1.5 *:indent-3">
                <li>
                  <strong className="text-foreground">Участник</strong> — в списке <code className="text-xs">users</code>, отвечает на
                  вопросы, получает очки и бонусы.
                </li>
                <li>
                  <strong className="text-foreground">Ведущий</strong> — создатель сессии: запускает игру, переключает вопросы, не играет
                  сам.
                </li>
                <li>
                  <strong className="text-foreground">Наблюдатель</strong> — в <code className="text-xs">observers</code>, смотрит игру без
                  права отвечать (ответ даст 403).
                </li>
                <li>
                  <strong className="text-foreground">Админ / менеджер</strong> — может перевести себя в наблюдатели, смотреть статистику
                  ответов и очки всех игроков.
                </li>
              </ul>
            </MechanicsSection>

            <MechanicsSection title="Очки и рейтинг">
              <div className="flex flex-col gap-2">
                <IconNote icon={<Clock className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                  У вопроса есть базовая стоимость (<code className="text-xs">base points</code>). За верный ответ в первые 3 секунды
                  начисляется 100% speed-части, затем она плавно снижается до 30% к концу таймера. Неверный ответ и пропуск speed-очков не
                  дают.
                </IconNote>
                <IconNote icon={<Trophy className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                  Рейтинг строится по итоговой сумме speed-очков, серии, стихий, бонусов вопроса и способностей. При равенстве выше тот, у
                  кого меньше{" "}
                  <code className="text-xs">telegram_id</code>. Итоговая сумма (<code className="text-xs">total_points</code>) и очки за
                  отдельный вопрос могут уйти <strong className="text-foreground">ниже нуля</strong> — штрафы стихий (ожог, рябь, трещина и
                  т.д.) суммируются без нижнего предела.
                </IconNote>
                <IconNote icon={<Target className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                  В блоке «Ваш рейтинг» показывается место, серия верных ответов и сколько очков не хватает до участника выше (
                  <code className="text-xs">points_to_prev</code>). Для топ-3 — отдельные мотивационные сообщения. Разбивка по эффектам — в{" "}
                  <code className="text-xs">element_effects</code> (сразу после ответа и в финальной статистике).
                </IconNote>
                <IconNote icon={<Crown className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                  Призовые места задаёт ведущий в лобби. Игрок на призовом месте видит бейдж «Призовое место»; список призёров обновляется
                  после завершения игры. Дополнительно сервер выбирает одного случайного призёра среди участников вне заданных мест — но
                  только среди тех, кто ответил верно на{" "}
                  <strong className="text-foreground">{RANDOM_PRIZE_MIN_CORRECT_PERCENT}% закрытых вопросов и больше</strong>. Доля считается
                  по закрытым вопросам, пропуск равен неверному ответу, ровно {RANDOM_PRIZE_MIN_CORRECT_PERCENT}% проходят. Если подходящих
                  игроков нет, случайный приз не разыгрывается.
                </IconNote>
              </div>
            </MechanicsSection>

            <MechanicsSection title="Одноразовые способности">
              <p>
                У каждого участника есть шесть общих способностей. Каждую можно использовать один раз за матч, а на одном вопросе разрешена
                только одна способность. Иконка открывает описание; применение нужно отдельно подтвердить кнопкой «Активировать».
              </p>
              <p className="text-xs text-white/55">
                Способность можно активировать до или после ответа, пока вопрос находится в статусе <code className="text-xs">GAME</code>.
                Активная способность отмечается на панели, использованная остаётся видимой, но повторно недоступна.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                {GAME_SKILLS.map((skill) => (
                  <SkillMechanicsCard key={skill.id} skill={skill} />
                ))}
              </div>
              <div className="mt-2 flex min-w-0 flex-col gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/65">
                <p>
                  <strong className="text-foreground">Соревновательные (PvP):</strong> «Вор» и «Туман» доступны только игрокам{" "}
                  <strong className="text-foreground/85">вне топ-3</strong> и при <strong className="text-foreground/85">4+</strong>{" "}
                  участниках. Цель выбирается случайно среди топ-3. «Вор» крадёт очки (щит цели блокирует кражу, суммарно не больше 8% base,
                  не ниже нуля), «Туман» гасит стихию цели на вопрос — аватар не затрагивается, и{" "}
                  <strong className="text-foreground/85">щит от тумана не спасает</strong>. Если цель уже ответила, её ответ
                  пересчитывается без стихии.
                </p>
                <p>
                  <strong className="text-foreground">Усиления:</strong> «Риск» умножает на 1.25 все начисления за вопрос — и плюсы, и
                  минусы. «Прилив» начисляется в конце вопроса по итоговому числу верно ответивших. Персональные эффекты способностей не
                  рассылаются через Socket.IO — результат приходит в <code className="text-[0.65rem]">skill_effects</code>.
                </p>
              </div>
            </MechanicsSection>

            <MechanicsSection title="Стихии и аватар игры">
              <p>
                Перед игрой можно выбрать стихию — она даёт уникальные бонусы и штрафы к очкам. Без выбора (
                <code className="text-xs">element = null</code>) действует только базовая механика: speed, streak и Lucky.
              </p>
              <p className="text-xs text-white/55">
                После подтверждения участия сервер случайно назначает <strong className="text-foreground/90">аватара игры</strong> (
                <code className="text-xs">element_avatar_id</code>). Если вы — аватар, ваша стихия не применяется — только правила аватара.
                Неверный ответ и пропуск (не ответил до закрытия вопроса) для стихий и штрафов — одно и то же.
              </p>
              <p className="text-xs text-white/55">
                «Искра» (огонь) и «Первенство» (аватар) начисляются{" "}
                <strong className="text-foreground/85">первому верно ответившему</strong> на вопросе — неверные ответы других игроков до вас
                не мешают. Это не путать с бонусом вопроса «Первый теряет стихию»: там считается самый первый клик, даже если ответ
                неверный.
              </p>
              <p className="text-xs text-white/55">
                Бонус вопроса <code className="text-[0.65rem]">ALL_ELEMENTS_BOOST</code> усиливает огонь, воду, землю и воздух на одном
                раунде (подробная таблица — в разделе «Бонусы вопроса»). Аватар и игроки без стихии не затрагиваются.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {GAME_ELEMENT_CARDS.map((card) => (
                  <ElementMechanicsCard key={card.id} card={card} />
                ))}
              </div>

              <div className="mt-3">
                <ElementMechanicsCard card={GAME_AVATAR_CARD} />
              </div>
            </MechanicsSection>

            <MechanicsSection title="Серия верных ответов (стрик)">
              <p>
                <Brain className="mr-1.5 inline size-4 align-text-bottom text-(--orb-border-four)" aria-hidden />
                Серия считается по завершённым вопросам: каждый верный ответ увеличивает streak, неверный ответ или пропуск сбрасывает в 0.
                В интерфейсе отображается визуальный ранг — те же названия и цвета, что в игре:
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                <li className="rounded-xl border border-white/12 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase">Warm-up</span>
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.14em] text-white/75">
                      START
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/65">0 ответов или 1 верный — без бонуса за серию</p>
                </li>
                {[...STREAK_TIER_DEFINITIONS].reverse().map((tier) => (
                  <StreakTierCard
                    key={tier.title}
                    title={tier.title}
                    badgeText={tier.badgeText}
                    rangeLabel={tier.rangeLabel}
                    bonusPercent={streakBonusPercent(tier.minStreak)}
                    containerClass={tier.containerClass}
                    titleClass={tier.titleClass}
                    badgeClass={tier.badgeClass}
                    pulse={tier.pulse}
                  />
                ))}
              </ul>
            </MechanicsSection>

            <MechanicsSection title="Бонус за серию">
              <div className="border-border bg-background flex min-w-0 flex-col gap-2 rounded-xl border p-4">
                <IconNote icon={<Zap className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                  Начиная со 2-го подряд верного ответа к очкам вопроса добавляется процент: +{STREAK_BONUS_STEP_PERCENT}%, затем +10%, +15%
                  и так далее — шаг {STREAK_BONUS_STEP_PERCENT}%, максимум{" "}
                  <strong className="text-foreground">{STREAK_BONUS_MAX_PERCENT}%</strong>.
                </IconNote>
                <p>
                  Бонус серии считается как процент от очков текущего ответа и уже входит в итог. После начисления на экране кратко
                  всплывает баннер «Бонус за серию» с процентом и суммой.
                </p>
                <p className="text-xs text-white/55">
                  Пример: при 5 верных подряд — +{streakBonusPercent(5)}% к очкам текущего ответа; при 8 и более — потолок{" "}
                  {STREAK_BONUS_MAX_PERCENT}%
                </p>
              </div>
            </MechanicsSection>

            <MechanicsSection title={`Случайный бонус +${LUCKY_BONUS_PERCENT}%`}>
              <div className="min-w-0 rounded-xl border border-dashed border-amber-300/35 bg-amber-500/8 p-4">
                <IconNote className="text-amber-50/95" icon={<Sparkles className="mt-0.5 size-4 text-amber-200" aria-hidden />}>
                  После закрытия вопроса среди игроков с <strong className="font-semibold">верным ответом</strong>, которые{" "}
                  <strong className="font-semibold">не в топ-3</strong> рейтинга, разыгрывается один случайный бонус —{" "}
                  <strong className="text-amber-200">+{LUCKY_BONUS_PERCENT}%</strong> от базовых очков вопроса (округление вниз).
                </IconNote>
                <p className="mt-2 text-sm text-white/80">
                  Пока розыгрыш не завершён, участнику вне топ-3 показывается тизер «Случайный бонус в розыгрыше». Победителю — анимация
                  «Повезло!» и всплывающее уведомление в комнате для всех. Очки уже включены в сумму ответа.
                </p>
                <p className="mt-2 text-xs text-white/55">
                  На вопросе с бонусом <code className="text-[0.65rem]">LUCKY_PLUS</code> к базовому проценту Lucky добавляется ещё{" "}
                  <strong className="text-foreground/85">+5%</strong> base: обычно 17% вместо 12%, у воздуха 29% вместо 24%, у аватара 23%
                  вместо 18%.
                </p>
                <p className="mt-2 text-xs text-white/55">Игроки в топ-3 в розыгрыше не участвуют — у них уже сильная позиция в таблице.</p>
              </div>
            </MechanicsSection>

            <MechanicsSection title="Бонусы вопроса">
              <p>
                При создании или редактировании квиза ведущий может назначить дополнительные правила на конкретный вопрос. Можно выбрать
                несколько бонусов сразу или оставить вопрос без них — тогда действуют только базовые механики (стихии, серия и Lucky).
                В игре активные бонусы показываются на карточке вопроса — иконка и полное описание правила.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                <QuestionBonusTimingGroup
                  title="При закрытии вопроса (END)"
                  description="Дописываются в element_effects после END и видны в my-rank / my-score. LUCKY_PLUS усиливает розыгрыш Lucky."
                  bonuses={QUESTION_BONUSES_AT_END}
                />
                <QuestionBonusTimingGroup
                  title="При ответе или пропуске"
                  description="Влияют на начисление сразу. REVERSE_SCORING и ALL_ELEMENTS_BOOST не отменяют стихии — добавляют поправку или меняют числа."
                  bonuses={QUESTION_BONUSES_ON_ANSWER}
                />
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {QUESTION_BONUS_OPTIONS.map((option) => {
                  const isNegative = isNegativeQuestionBonus(option.value)

                  return (
                    <li
                      key={option.value}
                      className={cn(
                        "rounded-xl border px-4 py-3",
                        isNegative ? "border-(--unfaithful)/35 bg-(--unfaithful)/8" : "border-(--accent-orb)/35 bg-(--accent-orb)/10",
                      )}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: isNegative ? "var(--unfaithful)" : "var(--accent-orb)" }}
                        >
                          <QuestionBonusIcon bonus={option.value} className="size-3.5 shrink-0 opacity-90" />
                          {option.label}
                        </span>
                        <code className="text-[0.65rem] tracking-wide text-white/45 uppercase">{option.value}</code>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-white/70">{option.detail}</p>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-4 flex min-w-0 flex-col gap-2">
                <p className="text-sm font-semibold text-white/85">ALL_ELEMENTS_BOOST — усиленные стихии</p>
                <AllElementsBoostTable />
              </div>
              <div className="mt-4 flex min-w-0 flex-col gap-2">
                <p className="text-sm font-semibold text-white/85">PROGRESSIVE_BONUS — нарастающий бонус верным</p>
                <ProgressiveBonusTable />
              </div>
              <div className="mt-4 flex min-w-0 flex-col gap-2">
                <p className="text-sm font-semibold text-white/85">SEQUENTIAL_ORDER_BONUS — порядок верных (N игроков)</p>
                <SequentialOrderBonusTable />
              </div>
              <p className="text-xs text-white/55">
                Бонусы вопроса складываются с глобальными правилами. End-бонусы (топ-3, слабейшие два, Lucky) считаются от уже записанного{" "}
                <code className="text-[0.65rem]">points_awarded</code>. Бонусы при ответе (
                <code className="text-[0.65rem]">REVERSE_SCORING</code>, <code className="text-[0.65rem]">PROGRESSIVE_BONUS</code>,{" "}
                <code className="text-[0.65rem]">SEQUENTIAL_ORDER_BONUS</code>, <code className="text-[0.65rem]">ALL_ELEMENTS_BOOST</code>)
                начисляются сразу. Если активен <code className="text-[0.65rem]">ALL_ELEMENTS_BOOST</code>, классическое «терпение» земли
                (последний верный при END) не начисляется — вместо него любой верный ответ земли получает +15% base сразу при ответе.
              </p>
            </MechanicsSection>

            <MechanicsSection title="Во время вопроса">
              <ul className="space-y-1.5 *:indent-3">
                <li>
                  <Clock className="mr-1 inline size-3.5 align-text-bottom" aria-hidden />
                  Таймер вопроса задаётся в шаблоне квиза. После истечения времени ответы блокируются, вопрос переходит в статус{" "}
                  <code className="text-xs">END</code>.
                </li>
                <li>
                  Повторный ответ на тот же вопрос невозможен (409 <code className="text-xs">already_answered</code>).
                </li>
                <li>
                  После закрытия вопроса показывается статистика: верно / неверно / воздержались. Пропуск до END — отдельная категория в UI;
                  после закрытия вопроса он экономически считается ошибкой (те же штрафы и сброс серии), но в статистике остаётся отдельной
                  категорией «воздержались».
                </li>
                <li>Одноразовую способность можно открыть, изучить и активировать как до ответа, так и после него — до закрытия вопроса.</li>
                <li>
                  На карточке вопроса во время фазы <code className="text-xs">GAME</code> показываются назначенные бонусы вопроса — с
                  иконкой и полным описанием правила.
                </li>
                <li>Участники могут отправлять эмоции в комнату — они видны всем как анимация на экране.</li>
              </ul>
            </MechanicsSection>

            <MechanicsSection title="Подключение и синхронизация">
              <p>
                Состояние игры приходит через Socket.IO (<code className="text-xs">quiz:event</code>): смена фаз, новый вопрос, конец
                вопроса, ответы других игроков, бонусы <code className="text-xs">streak-bonus</code> и{" "}
                <code className="text-xs">lucky-bonus</code>, вход и выход участников.
              </p>
              <p>
                Критичные события дублируются с задержкой (~2 с) для «догона» клиентов после обрыва связи. При переподключении клиент заново
                подгружает отчёт и активный вопрос.
              </p>
            </MechanicsSection>

            <MechanicsSection title="Полезно ведущему">
              <ul className="space-y-1.5 *:indent-3">
                <li>
                  <IconNote icon={<Users className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                    В лобби настройте призовые места до старта — с пустым списком останется только случайный приз.
                  </IconNote>
                </li>
                <li>
                  <IconNote icon={<Gift className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                    После финиша призёры получают личное сообщение в бота (нужен хотя бы один заход в Mini App).
                  </IconNote>
                </li>
                <li>
                  <IconNote icon={<ListChecks className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                    В шаблоне квиза можно помечать отдельные вопросы бонусами — финальные раунды, «ловушки» на стихии, обратный счёт,
                    усиление всех стихий или усиленный Lucky.
                  </IconNote>
                </li>
              </ul>
            </MechanicsSection>
          </div>
        </div>
      </section>
    </main>
  )
}
