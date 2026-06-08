const { existsSync, readFileSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const checks = [];

function commandCandidates(command, args) {
  if (process.platform === "win32" && command === "npm") {
    const candidates = [];

    if (process.env.npm_execpath) {
      candidates.push({
        command: process.execPath,
        args: [process.env.npm_execpath, ...args],
      });
    }

    candidates.push({ command: "npm.cmd", args });
    candidates.push({ command: "cmd.exe", args: ["/c", "npm", ...args] });

    return candidates;
  }

  return [{ command, args }];
}

function run(command, args = []) {
  let lastResult = null;

  for (const candidate of commandCandidates(command, args)) {
    const result = spawnSync(candidate.command, candidate.args, {
      cwd: root,
      encoding: "utf8",
    });

    lastResult = result;

    if (result.status === 0) {
      break;
    }
  }

  const result = lastResult || {};

  return {
    ok: result.status === 0,
    status: result.status,
    output: `${result.stdout || ""}${result.stderr || ""}${result.error ? result.error.message : ""}`.trim(),
  };
}

function add(name, status, detail, required = true) {
  checks.push({ name, status, detail, required });
}

function readPackageJson() {
  const packagePath = join(root, "package.json");

  if (!existsSync(packagePath)) {
    add("package.json", "FAIL", "Arquivo nao encontrado.");
    return null;
  }

  try {
    const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
    add("package.json", "OK", `${pkg.name || "sem nome"}@${pkg.version || "0.0.0"}`);
    return pkg;
  } catch (error) {
    add("package.json", "FAIL", `JSON invalido: ${error.message}`);
    return null;
  }
}

function checkCommand(name, command, args) {
  const result = run(command, args);
  add(name, result.ok ? "OK" : "FAIL", result.ok ? result.output.split(/\r?\n/)[0] : result.output || "Nao encontrado.");
}

function checkDocs() {
  const docs = [
    "AI_RULES.md",
    "ARCHITECTURE.md",
    "FEATURE_PLAN.md",
    "SECURITY_CHECKLIST.md",
    "LEARNING_LOG.md",
    "DECISIONS.md",
    "ROADMAP.md",
    "AI_SCOREBOARD.md",
  ];

  const missing = docs.filter((file) => !existsSync(join(root, "docs", file)));
  add("docs/", missing.length === 0 ? "OK" : "FAIL", missing.length === 0 ? "Todos os documentos base existem." : `Faltando: ${missing.join(", ")}`);
}

function checkPackageScripts(pkg) {
  if (!pkg) {
    add("scripts de teste", "FAIL", "package.json indisponivel.");
    return;
  }

  const requiredScripts = ["test", "test:coverage", "build", "test:e2e", "check", "check:full"];
  const missing = requiredScripts.filter((script) => !pkg.scripts || !pkg.scripts[script]);
  add("scripts de teste", missing.length === 0 ? "OK" : "FAIL", missing.length === 0 ? requiredScripts.join(", ") : `Faltando: ${missing.join(", ")}`);
}

async function checkOllama() {
  const baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  if (typeof fetch !== "function") {
    add("Ollama", "FAIL", "Fetch nativo indisponivel. Use Node 18+.");
    add("modelo qwen2.5-coder", "FAIL", "Nao foi possivel consultar modelos.");
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) {
      add("Ollama", "FAIL", `${baseUrl} respondeu HTTP ${response.status}.`);
      add("modelo qwen2.5-coder", "FAIL", "Nao foi possivel consultar modelos.");
      return;
    }

    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models.map((model) => model.name || "") : [];
    const hasCoderModel = models.some((name) => name.startsWith("qwen2.5-coder"));

    add("Ollama", "OK", baseUrl);
    add("modelo qwen2.5-coder", hasCoderModel ? "OK" : "FAIL", hasCoderModel ? models.filter((name) => name.startsWith("qwen2.5-coder")).join(", ") : `Modelos encontrados: ${models.join(", ") || "nenhum"}`);
  } catch (error) {
    add("Ollama", "FAIL", `${baseUrl} indisponivel: ${error.message}`);
    add("modelo qwen2.5-coder", "FAIL", "Nao foi possivel consultar modelos.");
  }
}

function printReport() {
  console.log("AI Quality Lab - Health Check");
  console.log("");

  for (const check of checks) {
    const marker = check.status.padEnd(4, " ");
    console.log(`[${marker}] ${check.name} - ${check.detail}`);
  }

  const failed = checks.filter((check) => check.required && check.status === "FAIL");

  console.log("");
  if (failed.length > 0) {
    console.log(`Resultado: ${failed.length} verificacao(oes) obrigatoria(s) falharam.`);
    process.exitCode = 1;
    return;
  }

  console.log("Resultado: ambiente pronto.");
}

async function main() {
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  add("Node.js", nodeMajor >= 18 ? "OK" : "FAIL", process.version);

  checkCommand("npm", "npm", ["--version"]);
  checkCommand("Git", "git", ["--version"]);

  const pkg = readPackageJson();
  add(".env.local", existsSync(join(root, ".env.local")) ? "OK" : "FAIL", existsSync(join(root, ".env.local")) ? "Arquivo encontrado." : "Arquivo nao encontrado.");
  checkDocs();
  checkPackageScripts(pkg);

  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  add("branch atual", branch.ok ? "OK" : "FAIL", branch.ok ? branch.output : "Nao foi possivel ler a branch.");

  await checkOllama();
  printReport();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
