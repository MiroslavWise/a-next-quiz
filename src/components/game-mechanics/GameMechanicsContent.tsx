import type { CSSProperties, PropsWithChildren, ReactNode } from "react"
import Image from "next/image"
import { Brain, Clock, Crown, Gift, ListChecks, Sparkles, Target, Trophy, Users, Zap } from "lucide-react"

import AppPageHeaders from "@/components/common/AppPageHeaders"

import { GAME_SKILLS, ULTIMATE_SKILLS, type GameSkillDefinition } from "@/enum/game-skill"
import { ElementAbilityEffectList } from "@/components/elements/ElementAbilityEffectList"
import {
  GAME_AVATAR_CARD,
  GAME_ELEMENT_CARDS,
  GAME_SKILL_RESONANCES,
  getResonanceAccent,
  getResonanceIconSrc,
  type GameElementCard,
} from "@/lib/game-elements-catalog"
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
  QUESTION_BONUSES_FOR_TEAMS,
  QUESTION_BONUSES_ON_ANSWER,
  getQuestionBonusLabel,
  isNegativeQuestionBonus,
  isTeamQuestionBonus,
  type QuestionBonus,
} from "@/enum/question-bonus"
import { QuestionBonusIcon } from "@/lib/question-bonus-icons"
import { MatchTitleMark } from "@/components/report/MatchTitleChip"
import { MATCH_TITLE_CATALOG } from "@/content/match-titles"
import { TEAM_BONUSES, type TeamBonusDefinition } from "@/lib/game-team-bonuses"

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
    <div className="border-border bg-background rounded-xl border p-3 sm:p-4">
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

function TeamBonusMechanicsCard({ bonus }: { bonus: TeamBonusDefinition }) {
  return (
    <article className="border-border bg-background flex min-w-0 flex-col rounded-xl border p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <h4 className="text-foreground text-sm font-semibold">{bonus.title}</h4>
        <code className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.6rem] tracking-wide text-white/45">
          {bonus.id}
        </code>
      </div>
      <p className="mt-0.5 text-xs font-medium text-(--accent-orb)">{bonus.short}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/70">{bonus.detail}</p>
    </article>
  )
}

function SkillMechanicsCard({ skill }: { skill: GameSkillDefinition }) {
  return (
    <article className="border-border bg-background flex min-w-0 flex-col rounded-xl border p-3 sm:p-4">
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

function ResonanceList() {
  return (
    <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
      {GAME_SKILLS.map((skill) => {
        const resonance = GAME_SKILL_RESONANCES[skill.id]
        if (!resonance) return null
        const accent = getResonanceAccent(resonance.element)

        return (
          <li
            key={skill.id}
            className="flex min-w-0 items-start gap-3 rounded-xl border bg-black/20 p-3"
            style={{ borderColor: `${accent}55` }}
          >
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-(--accent-orb)/40 bg-(--accent-orb)/12 text-(--accent-orb)">
              <GameSkillIcon skillId={skill.id} className="size-5" />
              <Image
                src={getResonanceIconSrc(resonance.element)}
                alt=""
                width={16}
                height={16}
                className="absolute -right-1 -bottom-1 size-4 rounded-full bg-black/60 object-contain p-px"
              />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold" style={{ color: accent }}>
                {resonance.title}
                <span className="ml-1.5 text-xs font-medium text-white/50">· {skill.title}</span>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-white/70">{resonance.detail}</p>
            </div>
          </li>
        )
      })}
    </ul>
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
          const team = isTeamQuestionBonus(bonus)
          const negative = !team && isNegativeQuestionBonus(bonus)

          return (
            <li
              key={bonus}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium",
                team && "border-sky-300/45 bg-sky-400/12 text-sky-50",
                negative && "border-(--unfaithful)/40 bg-(--unfaithful)/10 text-rose-50",
                !team && !negative && "border-(--accent-orb)/40 bg-(--accent-orb)/10 text-amber-50",
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
        <code className="text-[0.65rem]">2N/(N−1)</code> %. Штраф не глубже −15% base даже в большом зале. Только верный ответ; effect id:{" "}
        <code className="text-[0.65rem]">q_sequential_order_bonus</code>.
      </p>
    </div>
  )
}

function CharacterLadder({ title, lines }: { title: string; lines: string[] }) {
  return (
    <article className="border-border bg-background rounded-xl border p-3 sm:p-4">
      <h4 className="text-foreground text-sm font-semibold">{title}</h4>
      <ul className="mt-2 space-y-1 text-xs leading-relaxed text-white/70">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
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
          <Image src={card.iconSrc} alt="" className="size-10 object-contain" width={40} height={40} />
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

      <div className={cn("relative mt-3 grid min-w-0 gap-3", card.shortcomings.length > 0 ? "sm:grid-cols-2" : "grid-cols-1")}>
        <ElementAbilityEffectList title="Бонусы" effects={card.bonuses} variant="bonus" accentColor={accent} />
        <ElementAbilityEffectList title="Недостатки" effects={card.shortcomings} variant="penalty" accentColor={accent} />
      </div>
    </article>
  )
}

export default function GameMechanicsContent() {
  return (
    <div className="flex w-full min-w-0 flex-col">
      <AppPageHeaders
        title="Механика игры"
        description="Как проходит викторина, очки и бонусы"
        toolbarTitle="Правила и бонусы"
        accent="four"
        backTo="/"
        backAriaLabel="На главную"
        toolbarClassName="mb-4"
      />

      <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
            <MechanicsSection title="Как проходит игра">
              <p>
                Ведущий создаёт сессию отчёта по квизу и делится кодом подключения. Участники входят в лобби, затем игра проходит через
                несколько фаз — от ожидания до финальной таблицы.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <PhaseCard
                  phase="WAITING"
                  title="Лобби"
                  description="Участники подключаются по коду или QR, выбирают стихию и могут собрать пару из двух. Ведущий настраивает призовые места и сам в список игроков не входит. После старта состав пары заморожен."
                />
                <PhaseCard
                  phase="CHECKING"
                  title={`Подтверждение участия (${CHECKING_WINDOW_SECONDS} с)`}
                  description={`Ведущий запускает игру — открывается окно «Участвую» на ${CHECKING_WINDOW_SECONDS} секунд. Не подтвердившие удаляются из игры. Наблюдатели подтверждать не должны.`}
                />
                <PhaseCard
                  phase="START"
                  title={`Экран старта (${START_SPLASH_SECONDS} с)`}
                  description="Короткая заставка: сборка колоды перед первым вопросом."
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
                  Рейтинг строится по итоговой сумме speed-очков, серии, стихий, бонусов вопроса, способностей и бонусов пары. При равенстве выше тот, у
                  кого меньше{" "}
                  <code className="text-xs">telegram_id</code>. Итоговая сумма (<code className="text-xs">total_points</code>) и очки за
                  отдельный вопрос могут уйти <strong className="text-foreground">ниже нуля</strong> — отрицательные эффекты недостатков стихий (ожог, водоворот, обвал,
                  сквозняк и разлом) и
                  т.д.) суммируются без нижнего предела.
                </IconNote>
                <IconNote icon={<Target className="mt-0.5 size-4 text-(--orb-border-four)" aria-hidden />}>
                  В блоке «Ваш рейтинг» показывается место, серия верных ответов и сколько очков не хватает до участника выше (
                  <code className="text-xs">points_to_prev</code>). Для топ-3 — отдельные мотивационные сообщения. Разбивка по эффектам — в{" "}
                  <code className="text-xs">element_effects</code> и <code className="text-xs">team_effects</code> (сразу после ответа и в финальной статистике).
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

            <MechanicsSection title="Пары">
              <p>
                В лобби двое игроков могут встать в пару. Карточки стоят рядом и делят одну обводку — не цвет стихии. Своя пара подсвечена ярче:
                нажатие на свою карточку, партнёра или бейдж «пара» открывает бонусы. Места, призы и способности остаются личными. Общего рейтинга пары нет.
              </p>
              <p className="text-xs text-white/55">
                Собрать, принять и выйти можно только в <code className="text-[0.65rem]">WAITING</code>. Вор и Туман не выбирают партнёра целью.
                Сначала считается личный итог вопроса, потом бонусы пары. Пропуск для котла — то же, что неверный ответ. На отдельном вопросе можно включить «Связку», «Разрыв» или «Эхо» — они действуют только на пару.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                {TEAM_BONUSES.map((bonus) => (
                  <TeamBonusMechanicsCard key={bonus.id} bonus={bonus} />
                ))}
              </div>
            </MechanicsSection>

            <MechanicsSection title="Одноразовые способности">
              <p>
                У каждого участника есть шесть общих способностей. Каждую можно использовать один раз за матч, а на одном вопросе разрешена
                только одна способность. Иконка открывает описание; применение нужно отдельно подтвердить кнопкой «Активировать». Седьмая
                кнопка — ульта своей стихии: она видна всегда, но нажимается только с 10 уровня персонажа.
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
              <p className="mt-3 text-sm font-semibold text-white/85">Ульты 10 уровня</p>
              <p className="text-xs text-white/55">
                Одна на стихию, один раз за матч и не вместе с другой способностью на том же вопросе. Аватар игры ульту стихии не получает.
                Ниже 10 уровня кнопка на панели есть, но закрыта.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                {ULTIMATE_SKILLS.map((skill) => (
                  <SkillMechanicsCard key={skill.id} skill={skill} />
                ))}
              </div>
              <div className="mt-2 flex min-w-0 flex-col gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/65">
                <p>
                  <strong className="text-foreground">Соревновательные (PvP):</strong> «Вор» и «Туман» доступны только игрокам{" "}
                  <strong className="text-foreground/85">вне топ-3</strong> и при <strong className="text-foreground/85">4+</strong>{" "}
                  участниках. Цель выбирается случайно среди топ-3, партнёр по паре из целей вычёркивается. «Вор» крадёт очки (щит цели блокирует кражу, суммарно не больше 8% base,
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

            <MechanicsSection title="Резонансы">
              <p>
                Если способность совпадает со стихией игрока, она получает дополнительный эффект — резонанс. На панели способностей такая
                иконка отмечена значком стихии. Под туманом стихия гаснет, и резонанс не срабатывает.
              </p>
              <ResonanceList />
            </MechanicsSection>

            <MechanicsSection title="Персонажи">
              <p>
                У профиля четыре персонажа — по одному на стихию. Очки и уровень у каждого свои. Имя можно сменить на странице персонажа, очки
                от этого не меняются. На главной видны четыре уровня, карточка открывает лестницу способностей.
              </p>
              <p className="text-xs text-white/55">
                Уровень считается по накопленным очкам, от 0 до 50, и в базу отдельно не пишется. Первые два уровня стоят по 4 000 очков.
                Дальше каждый следующий уровень дороже предыдущего на 835: с 2 на 3 нужно 4 835, с 9 на 10 — 10 680. После 10 уровня новых
                способностей нет, растёт только число — до 50. За каждый вопрос уровень даёт % от base: верный — до +14% на 50 уровне (на 0 —
                0%), ошибка или пропуск — с шансом 25% до +7% на 50 уровне. Нужна выбранная стихия в матче.
              </p>
              <p className="text-xs text-white/55">
                Опыт приходит один раз в конце матча и равен итоговым очкам за игру, но не ниже нуля. 1 место добавляет 7%, 2 место — 5%, 3
                место — 3%. Призовое место, включая случайный приз, добавляет ещё 3%: множители перемножаются. Аватар делит итог на четыре
                персонажа поровну, без надбавки за место и приз. Нет стихии и вы не аватар — опыт 0. Наблюдатель, ведущий и тот, кого убрали
                из игры до финиша, опыт не получают. Стихия и уровень на матч фиксируются в момент старта: смена в профиле посреди игры
                подействует со следующей.
              </p>
              <p className="text-xs text-white/55">
                На 0 уровне у выбранной стихии работают только недостатки. Speed, обычная серия и Lucky остаются. У каждой способности на
                карточке стихии указано, с какого уровня она открывается; следующие уровни усиливают бонусы и смягчают недостатки. При выборе
                стихии в профиле закрытые способности показываются серыми.
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <CharacterLadder
                  title="Огонь"
                  lines={[
                    "0 — ожог и пепел",
                    "1 — жар, скорость ×1.15",
                    "2 — искра, первому верному +10%",
                    "3 — горение с серии 3+",
                    "4 — жар ×1.17",
                    "5 — искра +12%",
                    "6 — ожог слабее, −12%",
                    "7 — горение уже с серии 2+",
                    "8 — пепел реже, 12%",
                    "9 — ожог реже, 9%",
                    "10 — ульта «Феникс»",
                  ]}
                />
                <CharacterLadder
                  title="Вода"
                  lines={[
                    "0 — водоворот",
                    "1 — течение +5%",
                    "2 — эмпатия +5 за игрока, потолок 60",
                    "3 — ошибка снимает 1 шаг серии, если зал в основном прав",
                    "4 — течение +7%",
                    "5 — потолок эмпатии 72",
                    "6 — водоворот −16%",
                    "7 — в половине случаев серия не уменьшается",
                    "8 — водоворот реже, 13%",
                    "9 — эмпатия +6 за игрока",
                    "10 — ульта «Прилив жизни»",
                  ]}
                />
                <CharacterLadder
                  title="Земля"
                  lines={[
                    "0 — обвал",
                    "1 — корни: серия 6% за шаг, потолок 45%",
                    "2 — терпение, последний верный +17%",
                    "3 — монолит каждые 3 верных",
                    "4 — потолок серии 48%",
                    "5 — терпение +20%",
                    "6 — обвал −13%",
                    "7 — монолит каждые 2 верных",
                    "8 — обвал реже, 14%",
                    "9 — терпение +23%",
                    "10 — ульта «Гранит»",
                  ]}
                />
                <CharacterLadder
                  title="Воздух"
                  lines={[
                    "0 — сквозняк",
                    "1 — лёгкий ветер: серия 4% за шаг, потолок 42%",
                    "2 — порыв, 40% шанс +7%",
                    "3 — Lucky 24% вместо 12%",
                    "4 — усиленный порыв, 20% шанс +14%",
                    "5 — Lucky крадёт 3% у лидера",
                    "6 — порыв чаще, 45%",
                    "7 — сквозняк −12%",
                    "8 — Lucky 28%",
                    "9 — усиленный порыв чаще, 25%",
                    "10 — ульта «Смерч»",
                  ]}
                />
              </div>
            </MechanicsSection>

            <MechanicsSection title="Стихии и аватар игры">
              <p>
                В лобби до старта раунда можно выбрать стихию — она указывает, какой персонаж копит опыт и какие бонусы могут включиться. Без
                выбора (<code className="text-xs">element = null</code>) действует только базовая механика: speed, streak и Lucky, опыт
                персонажа не копится.
              </p>
              <p className="text-xs text-white/55">
                После подтверждения участия сервер случайно назначает <strong className="text-foreground/90">аватара игры</strong> (
                <code className="text-xs">element_avatar_id</code>). Если вы — аватар, ваша стихия не применяется — только правила аватара.
                Неверный ответ и пропуск (не ответил до закрытия вопроса) для стихий и штрафов — одно и то же.
              </p>
              <p className="text-xs text-white/55">
                Если у вопроса стоит метка стихии, верный ответ игрока той же стихии даёт +7% base («Своя стихия»). Аватар и игрок без стихии метку не
                получают, <code className="text-[0.65rem]">ALL_ELEMENTS_BOOST</code> это число не меняет. Туман и «первый теряет стихию» метку гасят.
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
                Исключения — «Защита», ульты «Феникс» и «Гранит», «Защитный прилив» воды, и «Ожог» огня на верном ответе (серия не растёт, бонус
                серии за этот вопрос не даётся). У земли и воздуха своя серия открывается с 1 уровня персонажа; до этого у всех обычные +5% за
                шаг и потолок 35%. «Защитный прилив» появляется с 3 уровня: ошибка снимает один шаг, если верно ответило больше половины зала.
                С 7 уровня воды в половине таких случаев серия не уменьшается. В интерфейсе отображается визуальный ранг — те же названия и
                цвета, что в игре:
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
                  Бонус серии считается как процент от очков текущего ответа и уже входит в итог. После ответа он виден в разбивке{" "}
                  <code className="text-xs">element_effects</code> (id <code className="text-xs">streak_bonus</code>) — в блоке рейтинга и в
                  финальной статистике.
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
                  Победителю после закрытия вопроса показывается блок «Повезло!» в рейтинге; всем в комнате — всплывающая карточка по
                  событию <code className="text-[0.65rem]">lucky-bonus</code>. Очки уже включены в сумму ответа.
                </p>
                <p className="mt-2 text-xs text-white/55">
                  На вопросе с бонусом <code className="text-[0.65rem]">LUCKY_PLUS</code> к базовому проценту Lucky добавляется ещё{" "}
                  <strong className="text-foreground/85">+5%</strong> base: обычно 17% вместо 12%, у аватара 23% вместо 18%. У воздуха 24%
                  вместо 12% открываются с 3 уровня персонажа, 28% — с 8; до этого Lucky обычный. С бонусом вопроса это 29% и 33%.
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
                <QuestionBonusTimingGroup
                  title="Только для пары"
                  description="Считаются при закрытии вопроса после подушки и серии пары. Строка попадает в team_effects. Игроку без пары бонус ничего не меняет."
                  bonuses={QUESTION_BONUSES_FOR_TEAMS}
                />
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {QUESTION_BONUS_OPTIONS.map((option) => {
                  const team = isTeamQuestionBonus(option.value)
                  const isNegative = !team && isNegativeQuestionBonus(option.value)

                  return (
                    <li
                      key={option.value}
                      className={cn(
                        "rounded-xl border px-4 py-3",
                        team && "border-sky-300/40 bg-sky-400/10",
                        isNegative && "border-(--unfaithful)/35 bg-(--unfaithful)/8",
                        !team && !isNegative && "border-(--accent-orb)/35 bg-(--accent-orb)/10",
                      )}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-semibold"
                          style={{ color: team ? "#7dd3fc" : isNegative ? "var(--unfaithful)" : "var(--accent-orb)" }}
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
                  после закрытия вопроса он экономически считается ошибкой (те же недостатки и сброс серии), но в статистике остаётся отдельной
                  категорией «воздержались».
                </li>
                <li>Одноразовую способность можно открыть, изучить и активировать как до ответа, так и после него — до закрытия вопроса.</li>
                <li>
                  На карточке вопроса во время фазы <code className="text-xs">GAME</code> показываются назначенные бонусы вопроса — с
                  иконкой и полным описанием правила.
                </li>
              </ul>
            </MechanicsSection>

            <MechanicsSection title="Подключение и синхронизация">
              <p>
                Состояние игры приходит через Socket.IO (<code className="text-xs">quiz:event</code>): смена фаз, новый вопрос, конец
                вопроса, ответы других игроков, событие <code className="text-xs">lucky-bonus</code>, вход и выход участников. Личные бонусы
                серии и разбивка очков — в ответе API <code className="text-xs">my-rank</code>. Активации способностей для ведущего и
                наблюдателей — в <code className="text-xs">quiz:staff-event</code> (
                <code className="text-xs">skill-activated</code>).
              </p>
              <p>
                Критичные события дублируются с задержкой (~2 с) для «догона» клиентов после обрыва связи. При переподключении клиент заново
                подгружает отчёт и активный вопрос.
              </p>
            </MechanicsSection>

            <MechanicsSection title="Достижения">
              <p>
                Когда матч переходит в <code className="text-xs">END</code>, сервер один раз записывает факты вечера. Достижение не даёт очков и
                не делит место. Кружки сидят на рамке карточки игрока: на подиуме, в строке рейтинга, в личном итоге и в своём результате.
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {MATCH_TITLE_CATALOG.map((item) => (
                  <li
                    key={item.id}
                    className={
                      item.rare
                        ? "rounded-xl border border-amber-200/70 bg-amber-900/40 px-4 py-3"
                        : "rounded-xl border border-amber-500/35 bg-amber-950/25 px-4 py-3"
                    }
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                      <MatchTitleMark id={item.id} className="size-4" />
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/70">{item.detail}</p>
                  </li>
                ))}
              </ul>
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
                    усиление всех стихий, усиленный Lucky или правила пары: связку, разрыв и эхо. Новый вопрос сразу включает «слабейшие два»
                    и «последние три» — их можно снять.
                  </IconNote>
                </li>
              </ul>
            </MechanicsSection>
      </div>
    </div>
  )
}
