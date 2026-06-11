import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const secretPatterns = [
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{20,}\b/],
  ['OpenAI API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ['Stripe live key', /\bsk_live_[A-Za-z0-9]{16,}\b/],
  ['Supabase secret key', /\bsb_secret_[A-Za-z0-9_-]{20,}\b/],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['Public environment secret', /\bNEXT_PUBLIC_(?:SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|IMOVEL_ADMIN_TOKEN)\b/],
]

const allowedEnvFiles = new Set(['.env.example', '.env.sample', '.env.template'])

function run(command, args) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
}

function npmCommand(args) {
  if (process.env.npm_execpath) {
    return run(process.execPath, [process.env.npm_execpath, ...args])
  }
  if (process.platform === 'win32') {
    return run('cmd.exe', ['/d', '/s', '/c', 'npm', ...args])
  }
  return run('npm', args)
}

function trackedFiles() {
  const result = run('git', [
    '-c',
    `safe.directory=${process.cwd()}`,
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '-z',
  ])
  if (result.status !== 0) {
    throw new Error(`Nao foi possivel listar arquivos rastreados: ${result.stderr || result.stdout}`)
  }
  return result.stdout.split('\0').filter(Boolean)
}

function scanTrackedFiles() {
  const findings = []

  for (const file of trackedFiles()) {
    const basename = file.replaceAll('\\', '/').split('/').at(-1)
    if (basename?.startsWith('.env') && !allowedEnvFiles.has(basename)) {
      findings.push(`${file}: arquivo de ambiente nao pode ser rastreado`)
      continue
    }

    let contents
    try {
      contents = readFileSync(file, 'utf8')
    } catch {
      continue
    }

    for (const [label, pattern] of secretPatterns) {
      if (pattern.test(contents)) findings.push(`${file}: ${label}`)
    }
  }

  if (findings.length > 0) {
    console.error('Security check: possiveis segredos ou configuracoes inseguras detectados:')
    for (const finding of findings) console.error(`- ${finding}`)
    return false
  }

  console.log('Security check: nenhum segredo conhecido em arquivos rastreados.')
  return true
}

function auditDependencies() {
  const result = npmCommand(['audit', '--json'])

  let report
  try {
    report = JSON.parse(result.stdout || '{}')
  } catch {
    console.error('Security check: npm audit nao retornou um relatorio JSON valido.')
    console.error((result.stderr || result.stdout || '').trim())
    return false
  }

  if (report.error) {
    console.error(`Security check: npm audit indisponivel: ${report.error.summary || report.error.message || 'erro desconhecido'}`)
    return false
  }

  const vulnerabilities = report.metadata?.vulnerabilities ?? {}
  const total = Number(vulnerabilities.total ?? 0)
  if (total > 0 || result.status !== 0) {
    console.error(
      `Security check: ${total} vulnerabilidade(s) encontrada(s) ` +
      `(critical=${vulnerabilities.critical ?? 0}, high=${vulnerabilities.high ?? 0}, ` +
      `moderate=${vulnerabilities.moderate ?? 0}, low=${vulnerabilities.low ?? 0}).`,
    )
    return false
  }

  console.log('Security check: npm audit sem vulnerabilidades conhecidas.')
  return true
}

const secretsOk = scanTrackedFiles()
const dependenciesOk = auditDependencies()

if (!secretsOk || !dependenciesOk) {
  process.exitCode = 1
} else {
  console.log('Security check: aprovado.')
}
