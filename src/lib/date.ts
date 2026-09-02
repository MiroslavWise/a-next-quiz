function toIsoLike(input: string) {
  let s = input.trim().replace(" ", "T")

  // Truncate fractional seconds to milliseconds (JS Date max precision)
  s = s.replace(/(\.\d{3})\d+/, "$1")

  // Normalize timezone: "+00" -> "Z", "+03" -> "+03:00", "+0300" -> "+03:00"
  if (/[+-]00$/.test(s)) {
    s = s.replace(/[+-]00$/, "Z")
  } else if (/[+-]\d{2}$/.test(s)) {
    s = s.replace(/([+-]\d{2})$/, "$1:00")
  } else if (/[+-]\d{4}$/.test(s)) {
    s = s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2")
  }

  return s
}

const dateTimeHHmmDDMMYYFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hourCycle: "h23",
})

/**
 * Преобразует дату вида "2026-03-17 12:34:42.106414+00" в "HH:mm DD/MM/YY".
 * Если строка не парсится — возвращает исходную.
 */
export function formatDateTimeHHmmDDMMYY(input: string) {
  const date = new Date(toIsoLike(input))
  if (Number.isNaN(date.getTime())) return input

  const parts = dateTimeHHmmDDMMYYFormatter.formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ""
  return `${get("hour")}:${get("minute")} ${get("day")}/${get("month")}/${get("year")}`
}

const dateTimeLongRuFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

/** Например: «23 июля 2026 г., 14:30». */
export function formatDateTimeLongRu(input: Date | string | number) {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ""
  return dateTimeLongRuFormatter.format(date)
}

const relativeTimeRu = new Intl.RelativeTimeFormat("ru", { numeric: "auto" })

const RELATIVE_DIVISIONS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
]

/** Относительное время, напр. «5 минут назад». */
export function formatDistanceToNowRu(input: Date | string | number) {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ""

  const diffSec = Math.round((date.getTime() - Date.now()) / 1000)
  const abs = Math.abs(diffSec)

  for (const [unit, secondsInUnit] of RELATIVE_DIVISIONS) {
    if (abs >= secondsInUnit || unit === "second") {
      return relativeTimeRu.format(Math.round(diffSec / secondsInUnit), unit)
    }
  }

  return relativeTimeRu.format(0, "second")
}
