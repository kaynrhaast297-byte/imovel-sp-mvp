import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { getPythonCandidates } from './python-runtime.mjs'

const pythonCandidates = getPythonCandidates()

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
  console.error('Falha ao executar testes do DevCheck: nenhum runtime Python funcional foi encontrado.')
  process.exit(1)
}

const args = selectedPython === 'py'
  ? ['-3', '-m', 'unittest', 'discover', '-s', 'tools/devcheck/tests', '-v']
  : ['-m', 'unittest', 'discover', '-s', 'tools/devcheck/tests', '-v']
result = spawnSync(selectedPython, args, { cwd: process.cwd(), stdio: 'inherit' })

if (result.error) {
  console.error(`Falha ao executar testes do DevCheck: ${result.error.message}`)
  process.exit(1)
}

process.exit(result.status ?? 1)
