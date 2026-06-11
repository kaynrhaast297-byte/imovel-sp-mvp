import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const result = spawnSync('git', ['config', '--get', 'core.hooksPath'], {
  cwd: process.cwd(),
  encoding: 'utf8',
})
const hooksPath = (result.stdout || '').trim()
const expected = '.githooks'
const hook = resolve(expected, 'pre-push')

if (result.status !== 0 || hooksPath !== expected) {
  console.error(`Hook nao instalado. Esperado core.hooksPath=${expected}, encontrado ${hooksPath || 'vazio'}.`)
  process.exit(1)
}

if (!existsSync(hook) || !readFileSync(hook, 'utf8').includes('npm run gate')) {
  console.error(`Hook pre-push invalido em ${hook}.`)
  process.exit(1)
}

console.log(`Hook pre-push aprovado: ${hook} chama npm run gate.`)
