import subprocess
import re
import json
import platform
import shutil
from pathlib import Path
from .models import Status, StepResult

SECRET_PATTERNS = [
    (r'(?i)(api[_-]?key|apikey)\s*=\s*["\']?[A-Za-z0-9_\-]{16,}', "API Key exposta"),
    (r'(?i)(secret|password|passwd|pwd)\s*=\s*["\']?.{8,}',        "Segredo/senha exposta"),
    (r'AKIA[0-9A-Z]{16}',                                           "AWS Access Key"),
    (r'(?i)bearer\s+[A-Za-z0-9\-._~+/]{20,}',                      "Bearer token exposto"),
]

# Diretórios ignorados no scan — inclui .next (build Next.js) e dist/out
SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv",
    ".devcheck", ".next", "dist", "out", "build", ".turbo",
    "coverage", ".nyc_output",
}

SCAN_EXTS = {".py", ".js", ".ts", ".jsx", ".tsx", ".env", ".json", ".yaml", ".yml", ".toml"}

# Arquivos .env de exemplo nunca são segredo real
SKIP_FILENAMES = {".env.example", ".env.sample", ".env.template"}


def scan_secrets(project: Path) -> StepResult:
    hits = []
    for f in project.rglob("*"):
        # Pula qualquer pasta da lista
        if any(part in SKIP_DIRS for part in f.parts):
            continue
        if f.name in SKIP_FILENAMES:
            continue
        if f.suffix not in SCAN_EXTS:
            continue
        try:
            text = f.read_text(errors="ignore")
        except Exception:
            continue
        for pattern, label in SECRET_PATTERNS:
            if re.search(pattern, text):
                hits.append(f"{label}: {f.relative_to(project)}")

    if hits:
        return StepResult(
            "Security Scan", Status.FAIL,
            f"{len(hits)} segredo(s) detectado(s)",
            detail="\n".join(hits),
            blocking=False,
        )
    return StepResult("Security Scan", Status.PASS, "Nenhum segredo exposto detectado")


def run_npm_audit(project: Path) -> StepResult:
    pkg = project / "package.json"
    if not pkg.exists():
        return StepResult("NPM Audit", Status.SKIPPED, "package.json não encontrado", blocking=False)

    npm = "npm.cmd" if platform.system() == "Windows" and shutil.which("npm.cmd") else "npm"
    try:
        r = subprocess.run(
            [npm, "audit", "--json"],
            cwd=project,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=180,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        return StepResult("NPM Audit", Status.FAIL, f"npm audit indisponivel: {error}")

    try:
        data = json.loads(r.stdout or "{}")
        if data.get("error"):
            message = data["error"].get("summary") or data["error"].get("message") or "erro desconhecido"
            return StepResult("NPM Audit", Status.FAIL, f"npm audit indisponivel: {message}")
        vulns = data.get("metadata", {}).get("vulnerabilities", {})
        total = vulns.get("total", 0)
        if total > 0 or r.returncode != 0:
            return StepResult("NPM Audit", Status.FAIL, f"{total} vulnerabilidade(s) conhecida(s)")
        return StepResult("NPM Audit", Status.PASS, "Sem vulnerabilidades conhecidas")
    except Exception as error:
        return StepResult("NPM Audit", Status.FAIL, f"Resposta invalida do npm audit: {error}")


def run_pip_audit(project: Path) -> StepResult:
    has_req = (project / "requirements.txt").exists() or (project / "pyproject.toml").exists()
    if not has_req:
        return StepResult("Pip Audit", Status.SKIPPED, "Projeto Python não detectado", blocking=False)

    r = subprocess.run(["pip-audit", "--format=json"], cwd=project, capture_output=True, text=True)
    if r.returncode == 127 or "not found" in r.stderr.lower():
        return StepResult("Pip Audit", Status.SKIPPED, "pip-audit não instalado", blocking=False)

    try:
        import json
        data = json.loads(r.stdout)
        vulns = [v for v in data if v.get("vulns")]
        if vulns:
            return StepResult("Pip Audit", Status.WARN, f"{len(vulns)} pacote(s) com vulnerabilidade", blocking=False)
        return StepResult("Pip Audit", Status.PASS, "Sem vulnerabilidades conhecidas")
    except Exception:
        return StepResult("Pip Audit", Status.SKIPPED, "Erro ao processar pip-audit", blocking=False)
