const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();

function run(command, args = []) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
  });

  return {
    ok: result.status === 0,
    output: `${result.stdout || ""}${result.stderr || ""}`.trim(),
  };
}

function readPackage() {
  const path = join(root, "package.json");

  if (!existsSync(path)) {
    return null;
  }

  return JSON.parse(readFileSync(path, "utf8"));
}

function escapeTable(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
const commit = run("git", ["rev-parse", "--short", "HEAD"]);
const status = run("git", ["status", "--short"]);
const pkg = readPackage();
const generatedAt = new Date().toISOString();

const commands = [
  ["Health check", "npm run health"],
  ["Fast check", "npm run check:fast"],
  ["Mandatory local gate", "npm run gate"],
  ["Coverage", "npm run test:coverage"],
  ["Build", "npm run build"],
  ["E2E", "npm run test:e2e"],
  ["Full check", "npm run check:full"],
  ["Security check", "npm run check:security"],
];

const commandRows = commands
  .filter(([, command]) => {
    const scriptName = command.replace("npm run ", "");
    return command === "npm audit" || (pkg && pkg.scripts && pkg.scripts[scriptName]);
  })
  .map(([name, command]) => `| ${name} | \`${command}\` | Pendente | |`)
  .join("\n");

const report = `# Validation Report

Generated at: ${generatedAt}

## Git

| Item | Value |
|---|---|
| Branch | ${escapeTable(branch.output || "desconhecida")} |
| Commit | ${escapeTable(commit.output || "desconhecido")} |
| Working tree | ${status.output ? "Com alteracoes" : "Limpa"} |

## Checks

Este script gera o relatorio, mas nao executa a suite. Uma entrega so pode ser aprovada depois que
\`npm run gate\` e o CI remoto passarem. Rode os comandos abaixo e atualize a coluna de resultado.

| Check | Command | Result | Notes |
|---|---|---|---|
${commandRows}

## AI Reviews

| Reviewer | Focus | Result | Notes |
|---|---|---|---|
| Codex | Implementacao e testes | Pendente | |
| Claude / ChatGPT | Arquitetura e produto | Pendente | |
| Ollama | Seguranca, bugs e edge cases | Pendente | |
| Humano | Decisao final | Pendente | |

## Security Notes

- Auth, Supabase, RLS, Storage, APIs e CI/CD exigem aprovacao obrigatoria.
- 'service_role' e segredos devem ficar somente no servidor.
- Upload de fotos exige validacao server-side, limite de tamanho e permissao minima no bucket.

## Learning Mode

~~~text
O que foi feito?

Por que foi feito?

Quais riscos existem?

Quais testes cobrem isso?

O que devo estudar agora?
~~~
`;

const reportsDir = join(root, "reports");
mkdirSync(reportsDir, { recursive: true });

const outputPath = join(reportsDir, "validation-report.md");
writeFileSync(outputPath, report, "utf8");

console.log(`Relatorio gerado em ${outputPath}`);
