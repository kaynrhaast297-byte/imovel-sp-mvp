import subprocess
from pathlib import Path
from .models import Status, StepResult


def _run(cmd: list[str], cwd: Path) -> tuple[int, str, str]:
    if cmd and cmd[0] == "git":
        cmd = ["git", "-c", f"safe.directory={cwd.resolve()}", *cmd[1:]]

    r = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return r.returncode, (r.stdout or "").strip(), (r.stderr or "").strip()


def check_git(project: Path, require_clean: bool = False) -> StepResult:
    # Verifica se é repo git
    code, out, _ = _run(["git", "rev-parse", "--is-inside-work-tree"], project)
    if code != 0:
        return StepResult("Git Check", Status.WARN, "Não é um repositório Git", blocking=False)

    issues = []

    # Branch atual
    _, branch, _ = _run(["git", "branch", "--show-current"], project)

    # Arquivos não rastreados perigosos
    _, untracked, _ = _run(["git", "ls-files", "--others", "--exclude-standard"], project)
    for f in untracked.splitlines():
        if any(s in f.lower() for s in [".env", "secret", "password", "credentials"]):
            issues.append(f"⚠️  Arquivo sensível sem .gitignore: {f}")

    # .env rastreado acidentalmente
    _, tracked, _ = _run(["git", "ls-files"], project)
    for f in tracked.splitlines():
        if f == ".env" or f.endswith("/.env"):
            issues.append(f"❌ .env está sendo rastreado pelo Git: {f}")

    if require_clean:
        _, status, _ = _run(["git", "status", "--porcelain", "--untracked-files=all"], project)
        if status:
            issues.append("Working tree nao esta limpa")

    if issues:
        return StepResult(
            "Git Check", Status.FAIL if require_clean else Status.WARN,
            f"Branch: {branch} | {len(issues)} alerta(s)",
            detail="\n".join(issues),
            blocking=require_clean,
        )

    return StepResult("Git Check", Status.PASS, f"Branch: {branch} | Sem problemas detectados")
