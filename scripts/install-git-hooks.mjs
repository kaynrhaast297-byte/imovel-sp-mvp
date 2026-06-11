import { spawnSync } from 'node:child_process'
import process from 'node:process'

const result = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
  cwd: process.cwd(),
  encoding: 'utf8',
})

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'Nao foi possivel configurar os hooks do Git.')
  process.exit(1)
}

console.log('Hooks instalados. Todo git push executara npm run gate.')
