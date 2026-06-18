import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

export function getPythonCandidates() {
  const home = process.env.USERPROFILE || process.env.HOME
  const codexPython = home
    ? join(home, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'python', 'python.exe')
    : ''

  return [
    process.env.DEVCHECK_PYTHON,
    codexPython && existsSync(codexPython) ? codexPython : '',
    'C:/Users/jonathan/AppData/Local/Programs/Python/Python312/python.exe',
    'python3',
    'python',
    'py',
  ].filter(Boolean)
}
