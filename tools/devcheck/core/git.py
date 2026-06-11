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


def _committed_diff_issue(project: Path) -> str:
    bases = ["origin/master", "origin/main", "origin/develop", "master", "main", "develop"]
    head_code, head, _ = _run(["git", "rev-parse", "HEAD"], project)

    for base in bases:
        code, _, _ = _run(["git", "rev-parse", "--verify", "--quiet", base], project)
        if code != 0:
            continue

        code, merge_base, _ = _run(["git", "merge-base", "HEAD", base], project)
        if code != 0 or not merge_base:
            continue
        if head_code == 0 and merge_base == head:
            return ""

        code, out, err = _run(["git", "diff", "--check", f"{merge_base}..HEAD"], project)
        if code != 0 or out or err:
            return out or err or "Diff commitado contem erros de whitespace"
        return ""

    code, out, err = _run(["git", "show", "--check", "--format=", "HEAD"], project)
    return out or err if code != 0 or out or err else ""


def check_git(
    project: Path,
    require_clean: bool = False,
    check_committed_diff: bool = True,
) -> StepResult:
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

    if check_committed_diff:
        committed_issue = _committed_diff_issue(project)
        if committed_issue:
            issues.append(f"Diff commitado invalido: {committed_issue}")

    if issues:
        return StepResult(
            "Git Check", Status.FAIL if require_clean else Status.WARN,
            f"Branch: {branch} | {len(issues)} alerta(s)",
            detail="\n".join(issues),
            blocking=require_clean,
        )

    return StepResult("Git Check", Status.PASS, f"Branch: {branch} | Sem problemas detectados")
