export function normalizeTelegramId(id: string | number): number {
  const n = typeof id === "string" ? Number(id) : id
  return Number.isFinite(n) ? Math.trunc(n) : NaN
}

/** Безопасный разбор telegram id из сокет-payload (число или строка). */
export function parseOptionalTelegramId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value)
  if (typeof value === "string") {
    const n = Number(value)
    return Number.isFinite(n) ? Math.trunc(n) : null
  }
  return null
}
