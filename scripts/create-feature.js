const { spawnSync } = require("child_process");

function runGit(args) {
  return spawnSync("git", args, {
    encoding: "utf8",
  });
}

function output(result) {
  return `${result.stdout || ""}${result.stderr || ""}`.trim();
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const rawName = process.argv[2];

if (!rawName) {
  fail("Uso: npm run feature:new -- nome-da-feature");
}

const slug = rawName.replace(/^feature\//, "").toLowerCase();

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  fail("Nome invalido. Use apenas letras minusculas, numeros e hifens. Exemplo: property-data");
}

const branchName = `feature/${slug}`;
const status = runGit(["status", "--porcelain"]);

if (status.status !== 0) {
  fail(`Nao foi possivel ler o status do Git.\n${output(status)}`);
}

if (output(status)) {
  fail("A arvore de trabalho tem alteracoes pendentes. Finalize ou guarde antes de criar uma feature.");
}

const exists = runGit(["rev-parse", "--verify", branchName]);

if (exists.status === 0) {
  fail(`A branch ${branchName} ja existe.`);
}

const currentBranch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
const baseBranch = output(currentBranch) || "desconhecida";
const created = runGit(["switch", "-c", branchName]);

if (created.status !== 0) {
  fail(`Falha ao criar branch ${branchName}.\n${output(created)}`);
}

console.log(`Branch criada: ${branchName}`);
console.log(`Base usada: ${baseBranch}`);
console.log("");
console.log("Proximos passos:");
console.log("1. Leia docs/AI_RULES.md, docs/ARCHITECTURE.md e docs/FEATURE_PLAN.md.");
console.log("2. Implemente uma mudanca pequena.");
console.log("3. Rode npm run check:full antes de abrir PR.");
console.log("4. Gere npm run report:validation e atualize o modo aprendiz.");
