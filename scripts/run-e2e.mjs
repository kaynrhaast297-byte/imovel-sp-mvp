import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const host = process.env.PLAYWRIGHT_HOST ?? 'localhost'
const port = process.env.PORT ?? '3000'
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`
const timeoutMs = 120_000

if (!existsSync('.next/BUILD_ID')) {
  console.error('Build de producao nao encontrado. Rode npm run build antes de npm run test:e2e.')
  process.exit(1)
}

async function isAvailable() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1_000)
    const response = await fetch(baseURL, { signal: controller.signal })
    clearTimeout(timeout)
    return response.status >= 200 && response.status < 500
  } catch {
    return false
  }
}

async function waitForServer(serverProcess) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Servidor Next encerrou antes de ficar pronto. Exit code: ${serverProcess.exitCode}`)
    }

    if (await isAvailable()) return
    await delay(250)
  }

  throw new Error(`Servidor Next nao respondeu em ${baseURL} dentro de ${timeoutMs}ms.`)
}

function runPlaywright(args) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['node_modules/@playwright/test/cli.js', 'test', ...args],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          E2E_MOCKS: '1',
          PLAYWRIGHT_BASE_URL: baseURL,
          PLAYWRIGHT_EXTERNAL_SERVER: '1',
        },
      },
    )

    child.on('exit', code => resolve(code ?? 1))
  })
}

function stopServer(serverProcess) {
  if (!serverProcess || serverProcess.exitCode !== null || !serverProcess.pid) return

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(serverProcess.pid), '/T', '/F'], {
      stdio: 'ignore',
      timeout: 5_000,
    })
    serverProcess.kill()
    serverProcess.unref()
    return
  }

  serverProcess.kill('SIGTERM')
  serverProcess.unref()
}

let serverProcess
let ownsServer = false

try {
  if (await isAvailable()) {
    console.log(`Reutilizando servidor existente em ${baseURL}`)
  } else {
    console.log(`Iniciando Next.js em ${baseURL}`)
    ownsServer = true
    serverProcess = spawn(
      process.execPath,
      ['node_modules/next/dist/bin/next', 'start', '--hostname', host, '--port', port],
      { stdio: 'inherit', env: { ...process.env, E2E_MOCKS: '1' } },
    )

    await waitForServer(serverProcess)
  }

  const exitCode = await runPlaywright(process.argv.slice(2))
  process.exitCode = exitCode
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  if (ownsServer) stopServer(serverProcess)
  process.exit(process.exitCode ?? 0)
}
