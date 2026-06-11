import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createServer } from 'node:net'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const host = process.env.PLAYWRIGHT_HOST ?? 'localhost'
const externalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === '1'
const timeoutMs = 120_000
const e2eAdminToken = process.env.E2E_ADMIN_TOKEN ?? 'e2e-admin-token'
const e2eEnv = {
  ...process.env,
  E2E_ADMIN_TOKEN: e2eAdminToken,
  E2E_MOCKS: '1',
  IMOVEL_ADMIN_TOKEN: e2eAdminToken,
}

async function availablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, host, () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : null
      server.close(error => {
        if (error) reject(error)
        else if (port) resolve(String(port))
        else reject(new Error('Nao foi possivel reservar uma porta para o E2E.'))
      })
    })
  })
}

const port = process.env.PORT ?? (externalServer ? '3000' : await availablePort())
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${host}:${port}`

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
          ...e2eEnv,
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
  if (externalServer) {
    if (!(await isAvailable())) {
      throw new Error(`PLAYWRIGHT_EXTERNAL_SERVER=1, mas nenhum servidor respondeu em ${baseURL}.`)
    }
    console.log(`Usando servidor externo solicitado em ${baseURL}`)
  } else {
    if (await isAvailable()) {
      throw new Error(`A porta isolada do E2E ja esta ocupada em ${baseURL}.`)
    }
    console.log(`Iniciando servidor E2E isolado em ${baseURL}`)
    ownsServer = true
    serverProcess = spawn(
      process.execPath,
      ['node_modules/next/dist/bin/next', 'start', '--hostname', host, '--port', port],
      { stdio: 'inherit', env: e2eEnv },
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
