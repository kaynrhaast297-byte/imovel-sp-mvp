import { existsSync, readFileSync } from 'node:fs'

export function parseEnvFile(content) {
  const env = {}

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed
    const index = normalized.indexOf('=')
    if (index <= 0) continue

    const key = normalized.slice(0, index).trim()
    let value = normalized.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

export function readEnvFile(file) {
  return parseEnvFile(readFileSync(file, 'utf8'))
}

export function loadEnvFileIntoProcess(file) {
  if (!existsSync(file)) return false

  const env = readEnvFile(file)
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }
  return true
}

export function cleanBaseUrl(url) {
  return url.replace(/\/+$/, '')
}
