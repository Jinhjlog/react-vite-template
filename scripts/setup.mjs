#!/usr/bin/env node
/**
 * 프로젝트 부트스트랩 (대화형)
 *
 * 이 템플릿을 복제한 직후 1회 실행해서 자기 프로젝트로 바꾼다.
 * 프로젝트 이름 치환 · .env.local 생성 · (선택) git 첫 커밋.
 *
 * 사용법:
 *   npm run setup                          대화형
 *   npm run setup -- --dry                 미리보기 (아무것도 바꾸지 않음)
 *   npm run setup -- --yes                 전부 기본값으로 진행
 *   npm run setup -- --name my-app         이름을 인자로 (프롬프트 생략)
 *   npm run setup -- --api-url https://... API 주소를 인자로
 *
 * 의존성 없음 — Node 내장 모듈만 사용한다.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATE_NAME = 'react-vite-template'
const DEFAULT_API_URL = ''

const C = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  off: '\x1b[0m',
}
const info = (s) => console.log(`${C.green}${s}${C.off}`)
const warn = (s) => console.log(`${C.yellow}${s}${C.off}`)
const fail = (s) => console.error(`${C.red}${s}${C.off}`)
const dim = (s) => console.log(`${C.dim}${s}${C.off}`)

// ── 인자 파싱 ──────────────────────────────────────
function parseArgs(argv) {
  const flags = { dry: false, yes: false, name: null, apiUrl: null }
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--dry') flags.dry = true
    else if (a === '--yes' || a === '-y') flags.yes = true
    else if (a === '--name') flags.name = argv[++i] ?? null
    else if (a === '--api-url') flags.apiUrl = argv[++i] ?? null
  }
  // TTY가 아니면(CI·파이프) 프롬프트를 띄울 수 없으므로 기본값으로 진행
  if (!process.stdin.isTTY) flags.yes = true
  return flags
}

const flags = parseArgs(process.argv.slice(2))
const p = (rel) => resolve(ROOT, rel)
const read = (rel) => readFileSync(p(rel), 'utf8')

/** 실제 쓰기는 여기만 통과한다. --dry 면 기록만 하고 쓰지 않는다. */
const ops = []
function write(rel, next) {
  ops.push({ file: rel, action: '수정' })
  if (!flags.dry) writeFileSync(p(rel), next)
}
function created(rel, action = '생성') {
  ops.push({ file: rel, action })
}

const isKebab = (s) => /^[a-z][a-z0-9-]*$/.test(s)

// ── 현재 상태 ──────────────────────────────────────
const pkg = JSON.parse(read('package.json'))
const currentName = typeof pkg.name === 'string' ? pkg.name : TEMPLATE_NAME

console.log('')
info('════════════════════════════════════════')
info(' 프로젝트 부트스트랩')
info('════════════════════════════════════════')
if (flags.dry) warn('[DRY RUN] 실제 파일은 변경하지 않습니다.')
console.log(`현재 프로젝트 이름: ${C.bold}${currentName}${C.off}`)
console.log('')

const rl = flags.yes ? null : createInterface({ input: process.stdin, output: process.stdout })
const ask = async (q, fallback) => {
  if (!rl) return fallback
  const answer = (await rl.question(q)).trim()
  return answer === '' ? fallback : answer
}
const confirm = async (q, initial) => {
  if (!rl) return initial
  const hint = initial ? '(Y/n)' : '(y/N)'
  const answer = (await rl.question(`${q} ${hint}: `)).trim().toLowerCase()
  if (answer === '') return initial
  return answer === 'y' || answer === 'yes'
}

try {
  // ── 이미 세팅된 프로젝트인지 ────────────────────
  if (currentName !== TEMPLATE_NAME) {
    warn(`이미 부트스트랩된 프로젝트로 보입니다 (name=${currentName}).`)
    const go = await confirm('계속 진행할까요?', false)
    if (!go) {
      console.log('취소했습니다.')
      process.exit(0)
    }
    console.log('')
  }

  // ── 1. 프로젝트 이름 ────────────────────────────
  const name =
    flags.name ??
    (await ask(`${C.bold}프로젝트 이름${C.off} (kebab-case, 예: movie-app) [${currentName}]: `, currentName))

  if (!isKebab(name)) {
    fail(`이름은 소문자·숫자·하이픈만 쓸 수 있습니다 (kebab-case): '${name}'`)
    process.exit(1)
  }

  // ── 2. 설명 ─────────────────────────────────────
  const currentDesc = typeof pkg.description === 'string' ? pkg.description : ''
  const description = await ask(
    `${C.bold}프로젝트 설명${C.off}${currentDesc ? ` [${currentDesc}]` : ' (비워도 됨)'}: `,
    currentDesc,
  )

  // ── 3. API 주소 ─────────────────────────────────
  const apiUrl =
    flags.apiUrl ??
    (await ask(
      `${C.bold}백엔드 API 주소${C.off} (.env.local 에 저장, 비우면 /api 사용): `,
      DEFAULT_API_URL,
    ))

  // ── 치환 ────────────────────────────────────────
  console.log('')
  info('변경 예정:')

  // package.json
  if (currentName !== name || currentDesc !== description) {
    pkg.name = name
    if (description) pkg.description = description
    write('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
    console.log(`  package.json      name: ${currentName} → ${name}`)
    if (description) console.log(`                    description: ${description}`)
  }

  // index.html <title>
  const html = read('index.html')
  const nextHtml = html.replace(/<title>[^<]*<\/title>/, `<title>${name}</title>`)
  if (nextHtml !== html) {
    write('index.html', nextHtml)
    console.log(`  index.html        <title> → ${name}`)
  }

  // README.md 첫 제목
  const readme = read('README.md')
  const nextReadme = readme.replace(/^# .*$/m, `# ${name}`)
  if (nextReadme !== readme) {
    write('README.md', nextReadme)
    console.log(`  README.md         제목 → # ${name}`)
  }

  // .env.local
  if (existsSync(p('.env.local'))) {
    console.log(`  .env.local        ${C.dim}이미 있어 건드리지 않음${C.off}`)
  } else if (existsSync(p('.env.example'))) {
    const env = read('.env.example').replace(/^VITE_API_BASE_URL=.*$/m, `VITE_API_BASE_URL=${apiUrl}`)
    if (!flags.dry) writeFileSync(p('.env.local'), env)
    created('.env.local')
    console.log(`  .env.local        생성 (VITE_API_BASE_URL=${apiUrl || '(비어 있음)'})`)
  }

  if (ops.length === 0) {
    console.log(`  ${C.dim}변경할 것이 없습니다.${C.off}`)
  }

  // ── 4. git ──────────────────────────────────────
  console.log('')
  // git 명령은 셸을 거치지 않고 직접 실행한다.
  // 셸을 거치면 Windows(cmd.exe)에서 따옴표·이모지 인코딩이 깨진다.
  const git = (args, opts = {}) => execFileSync('git', args, { cwd: ROOT, ...opts })

  let commitCount = null
  try {
    commitCount = Number(
      git(['rev-list', '--count', 'HEAD'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(),
    )
  } catch {
    commitCount = existsSync(p('.git')) ? 0 : null
  }

  if (commitCount === null) {
    warn('git 저장소가 아닙니다 — git 단계는 건너뜁니다.')
  } else if (commitCount === 0) {
    // 커밋이 없다 = 되돌릴 히스토리도 없다. 안전하므로 기본값 Yes.
    const doCommit = await confirm(`${C.bold}첫 커밋을 만들까요?${C.off}`, true)
    if (doCommit && !flags.dry) {
      git(['add', '-A'])
      git(['commit', '-q', '-m', `🎉 init: ${name}`])
      info(`✓ 첫 커밋 생성 — 🎉 init: ${name}`)
    } else if (doCommit) {
      console.log('  [DRY RUN] git add -A && git commit')
    }
  } else {
    // 히스토리가 있다 = 지우면 되돌릴 수 없다. 기본값 No.
    warn(`기존 커밋 ${commitCount}개가 있습니다.`)
    const doReset = await confirm(
      `${C.bold}템플릿 히스토리를 지우고 새로 시작할까요?${C.off} ${C.red}(되돌릴 수 없습니다)${C.off}`,
      false,
    )
    if (doReset && !flags.dry) {
      // rm -rf 는 Windows(cmd.exe)에 없는 명령이다. Node 내장 API를 쓴다.
      rmSync(p('.git'), { recursive: true, force: true })
      git(['init', '-q'])
      git(['add', '-A'])
      git(['commit', '-q', '-m', `🎉 init: ${name}`])
      info(`✓ git 히스토리 초기화 + 첫 커밋`)
    } else if (doReset) {
      console.log('  [DRY RUN] .git 삭제 → git init → git add -A → git commit')
    } else {
      console.log('  히스토리는 그대로 둡니다.')
    }
  }

  // ── 완료 ────────────────────────────────────────
  console.log('')
  info('════════════════════════════════════════')
  info(flags.dry ? ` DRY RUN 완료 — 실제 변경 없음` : ` 부트스트랩 완료: ${name}`)
  info('════════════════════════════════════════')
  console.log('다음 단계:')
  console.log('  1. npm install')
  console.log('  2. npm run dev            → http://localhost:5173')
  console.log('  3. .env.local 값 채우기 (백엔드가 있다면)')
  console.log('')
  dim('에이전트로 작업할 때는 세션 시작 후 "지침확인" 을 먼저 입력하세요.')
  console.log('')
} finally {
  rl?.close()
}
