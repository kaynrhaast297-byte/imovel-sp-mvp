import shutil
import subprocess
from pathlib import Path
from .models import Status, StepResult


def check_health(project: Path, project_type: str) -> list[StepResult]:
    results = []

    # --- Ferramentas base ---
    tools = ["git"]
    if project_type in ("node", "nextjs", "react"):
        tools += ["node", "npm"]
    elif project_type == "python":
        tools += ["python"]
    elif project_type == "go":
        tools += ["go"]
    elif project_type == "rust":
        tools += ["cargo"]

    missing = [t for t in tools if not shutil.which(t)]
    if missing:
        results.append(StepResult(
            "Ferramentas", Status.WARN,
            f"Ausentes: {', '.join(missing)}",
            blocking=False,
        ))
    else:
        results.append(StepResult("Ferramentas", Status.PASS, f"Todas disponíveis: {', '.join(tools)}"))

    # --- Docker (opcional) ---
    if shutil.which("docker"):
        r = subprocess.run(["docker", "info"], capture_output=True, text=True)
        if r.returncode == 0:
            results.append(StepResult("Docker", Status.PASS, "Docker disponível e rodando"))
        else:
            results.append(StepResult("Docker", Status.WARN, "Docker instalado mas daemon não está rodando", blocking=False))
    else:
        results.append(StepResult("Docker", Status.SKIPPED, "Docker não instalado (opcional)", blocking=False))

    # --- Arquivo de config devcheck ---
    cfg = project / "devcheck.json"
    if cfg.exists():
        results.append(StepResult("devcheck.json", Status.PASS, "Configuração encontrada"))
    else:
        results.append(StepResult("devcheck.json", Status.WARN, "devcheck.json não encontrado — usando defaults", blocking=False))

    # --- .gitignore ---
    gi = project / ".gitignore"
    if gi.exists():
        content = gi.read_text()
        missing_entries = [e for e in [".env", "node_modules", "__pycache__"] if e not in content]
        if missing_entries:
            results.append(StepResult(".gitignore", Status.WARN, f"Entradas faltando: {', '.join(missing_entries)}", blocking=False))
        else:
            results.append(StepResult(".gitignore", Status.PASS, "Entradas essenciais presentes"))
    else:
        results.append(StepResult(".gitignore", Status.WARN, ".gitignore não encontrado", blocking=False))

    return results
