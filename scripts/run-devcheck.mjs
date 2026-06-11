import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const command = process.argv[2] ?? 'approve'
const cliPath = resolve(process.env.DEVCHECK_CLI ?? 'tools/devcheck/cli/main.py')
const logPath = resolve('.devcheck/logs/ultima-execucao.txt')
const pythonCandidates = [
  process.env.DEVCHECK_PYTHON,
  'C:/Users/jonathan/AppData/Local/Programs/Python/Python312/python.exe',
  'python3',
  'python',
  'py',
].filter(Boolean)

if (!existsSync(cliPath)) {
  console.error(`DevCheck nao encontrado em ${cliPath}.`)
  process.exit(1)
}

let result
let selectedPython
for (const python of pythonCandidates) {
  const versionArgs = python === 'py' ? ['-3', '--version'] : ['--version']
  const probe = spawnSync(python, versionArgs, { cwd: process.cwd(), encoding: 'utf8' })
  if (!probe.error && probe.status === 0) {
    selectedPython = python
    break
  }
}

if (!selectedPython) {
  console.error('Falha ao executar DevCheck: nenhum runtime Python funcional foi encontrado.')
  process.exit(1)
}

const args = selectedPython === 'py'
  ? ['-3', cliPath, command, process.cwd()]
  : [cliPath, command, process.cwd()]
result = spawnSync(selectedPython, args, { cwd: process.cwd(), stdio: 'inherit' })

if (result.error) {
  console.error(`Falha ao executar DevCheck: ${result.error.message}`)
  process.exit(1)
}

if (result.status !== 0) process.exit(result.status ?? 1)

if (!existsSync(logPath)) {
  console.error('DevCheck terminou sem gerar o comprovante da ultima execucao.')
  process.exit(1)
}

const log = readFileSync(logPath, 'utf8')
if (!log.includes('APROVADO') || /\b(?:WARN|FAIL|ERROR|SKIPPED)\b/.test(log)) {
  console.error('DevCheck retornou sucesso, mas o comprovante nao representa aprovacao integral.')
  process.exit(1)
}

console.log(`DevCheck estrito aprovado. Comprovante salvo em ${logPath}.`)
