/**
 * Копирует файлы из другого git-репозитория (например, бэкенда) в этот проект.
 *
 * Настройка — переменные окружения или файл `.env.sync` в корне (не коммитить).
 * Пример см. `scripts/sync.env.example`.
 *
 * Запуск:
 *   npm run sync:backend
 * или:
 *   node --env-file=.env.sync scripts/sync-from-repo.mjs
 *
 * Требуется установленный `git` в PATH.
 */
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

function loadEnvSyncFile() {
  const p = path.join(ROOT, ".env.sync")
  if (!fs.existsSync(p)) return
  const content = fs.readFileSync(p, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadEnvSyncFile()

const REPO_URL = process.env.SYNC_REPO_URL
const REF = process.env.SYNC_REPO_REF || "main"
const MAP_RAW = process.env.SYNC_MAP
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN

function injectToken(url) {
  if (!TOKEN) return url
  if (url.includes("@")) return url
  if (!url.startsWith("https://")) return url
  return url.replace("https://", `https://x-access-token:${TOKEN}@`)
}

/**
 * Одна запись SYNC_MAP: `путь/в/репо:путь/во/фронте` или коротко `путь/в/репо` (тогда копируется в тот же путь).
 * Для Windows: `D:/src/x.ts:app/x.ts` — двоеточие после буквы диска не считается разделителем.
 */
function splitSourceDest(segment) {
  const s = segment.trim().replace(/\\/g, "/")
  if (!s) return null

  const drivePath = /^([A-Za-z]:)(\/.*)$/.exec(s)
  if (drivePath) {
    const rest = drivePath[2]
    const sep = rest.indexOf(":")
    if (sep === -1) return { from: s, to: s }
    return {
      from: (drivePath[1] + rest.slice(0, sep)).replace(/\\/g, "/"),
      to: rest.slice(sep + 1).trim(),
    }
  }

  const idx = s.indexOf(":")
  if (idx === -1) {
    return { from: s, to: s }
  }
  return {
    from: s.slice(0, idx).trim(),
    to: s.slice(idx + 1).trim(),
  }
}

function parseMap(raw) {
  if (!raw?.trim()) return []
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pair) => {
      const sp = splitSourceDest(pair)
      if (!sp?.from || !sp?.to) {
        throw new Error(`SYNC_MAP: пустой путь в записи: ${pair}`)
      }
      return { from: sp.from, to: sp.to }
    })
}

function copyEntry(fromAbs, toRel) {
  const toAbs = path.join(ROOT, toRel)
  if (!fs.existsSync(fromAbs)) {
    throw new Error(`Источник не найден: ${fromAbs}`)
  }
  const stat = fs.statSync(fromAbs)
  fs.mkdirSync(path.dirname(toAbs), { recursive: true })
  if (stat.isDirectory()) {
    fs.cpSync(fromAbs, toAbs, { recursive: true })
  } else {
    fs.copyFileSync(fromAbs, toAbs)
  }
}

function main() {
  const pairs = parseMap(MAP_RAW)
  if (!REPO_URL || pairs.length === 0) {
    console.error(
      ["Задайте SYNC_REPO_URL и SYNC_MAP (см. scripts/sync.env.example).", "Можно положить переменные в корневой файл .env.sync"].join(
        "\n",
      ),
    )
    process.exit(1)
  }

  const cloneUrl = injectToken(REPO_URL)
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "a-quiz-sync-"))
  const cloneDir = path.join(tmpBase, "repo")

  try {
    const safeUrl = REPO_URL.replace(/x-access-token:[^@]+@/, "")
    console.log(`Клонирование (shallow): ${safeUrl}`)
    try {
      execFileSync("git", ["clone", "--depth", "1", "-b", REF, cloneUrl, cloneDir], {
        stdio: "inherit",
      })
    } catch {
      console.log(`Ветка "${REF}" не сработала, пробуем клон без -b и checkout…`)
      execFileSync("git", ["clone", "--depth", "1", cloneUrl, cloneDir], {
        stdio: "inherit",
      })
      execFileSync("git", ["-C", cloneDir, "checkout", REF], { stdio: "inherit" })
    }

    for (const { from, to } of pairs) {
      const fromAbs = path.join(cloneDir, ...from.split("/"))
      console.log(`Копирую: ${from} → ${to}`)
      copyEntry(fromAbs, to)
    }

    console.log("Готово.")
  } finally {
    fs.rmSync(tmpBase, { recursive: true, force: true })
  }
}

main()
