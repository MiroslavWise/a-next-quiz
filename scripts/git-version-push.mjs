/**
 * Поднимает версию, коммитит все изменения и пушит в git.
 *
 *   npm run git           — patch (1.0.0 → 1.0.1)
 *   npm run git -- minor  — minor
 *   npm run git -- major  — major
 *
 * Сообщение коммита:
 *   - первая строка — новая версия (например `1.0.1`);
 *   - далее пункты из `.git-next.md` → секция `## Изменения`.
 * Если пунктов нет — только версия.
 *
 * После успешного push `.git-next.md` сбрасывается к пустому шаблону.
 */
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const CHANGELOG_FILE = ".git-next.md"
const CHANGELOG_PATH = path.join(ROOT, CHANGELOG_FILE)
const COMMIT_MSG_PATH = path.join(ROOT, ".git-commit-msg.txt")

const CHANGELOG_EMPTY_TEMPLATE = `# Следующий коммит

Черновик для \`npm run git\`: пункты из «Изменения» → тело коммита → push → сброс файла. Пиши компактно (одна короткая строка на пункт).

## Изменения

`

const bumpArg = process.argv[2]
const bump = ["patch", "minor", "major"].includes(bumpArg) ? bumpArg : "patch"

function run(command) {
  execSync(command, { cwd: ROOT, stdio: "inherit", shell: true })
}

function readChangelogBullets() {
  if (!fs.existsSync(CHANGELOG_PATH)) return []

  const content = fs.readFileSync(CHANGELOG_PATH, "utf8")
  const lines = content.split(/\r?\n/)
  const sectionIndex = lines.findIndex((line) => /^##\s+Изменения\s*$/i.test(line.trim()))
  if (sectionIndex === -1) return []

  const bullets = []
  for (let i = sectionIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    if (line.startsWith("## ")) break
    if (line.startsWith("<!--")) continue

    const match = /^-\s+(.+)$/.exec(line)
    if (!match) continue

    const text = match[1].trim()
    if (text) bullets.push(text)
  }

  return bullets
}

function buildCommitMessage(version, bullets) {
  if (!bullets.length) return version
  return `${version}\n\n${bullets.map((item) => `- ${item}`).join("\n")}`
}

function resetChangelogFile() {
  fs.writeFileSync(CHANGELOG_PATH, CHANGELOG_EMPTY_TEMPLATE, "utf8")
}

const bullets = readChangelogBullets()

run(`npm version ${bump} --no-git-tag-version`)

const version = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version
const commitMessage = buildCommitMessage(version, bullets)

resetChangelogFile()

fs.writeFileSync(COMMIT_MSG_PATH, commitMessage, "utf8")

try {
  run("git add .")
  run(`git commit -F "${COMMIT_MSG_PATH}"`)
  run("git push")
} finally {
  if (fs.existsSync(COMMIT_MSG_PATH)) {
    fs.unlinkSync(COMMIT_MSG_PATH)
  }
}

console.log(`\nГотово: v${version} запушена.`)
if (bullets.length) {
  console.log(`В коммит вошло пунктов из ${CHANGELOG_FILE}: ${bullets.length}`)
}
console.log(`${CHANGELOG_FILE} сброшен к шаблону.`)
