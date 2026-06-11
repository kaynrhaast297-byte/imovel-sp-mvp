import subprocess
import time
import shutil
import platform as _platform
from pathlib import Path
from typing import Callable

from .models import Status, StepResult, RunResult
from .detector import detect_project, load_devcheck_config

_DEFAULT_TEST_CMD: dict[str, list[str]] = {
    "python":  ["python", "-m", "pytest", "-v"],
    "nextjs":  ["npm", "run", "test", "--", "--watchAll=false"],
    "react":   ["npm", "run", "test", "--", "--watchAll=false"],
    "node":    ["npm", "test"],
    "go":      ["go", "test", "./..."],
    "rust":    ["cargo", "test"],
    "java":    ["mvn", "test"],
    "generic": [],
}

_DEFAULT_BLOCKING: dict[str, bool] = {
    "git_check":         False,
    "quality_gates":     True,
    "unit_tests":        True,
    "integration_tests": True,
    "e2e_tests":         True,
    "coverage":          False,
    "security_scan":     False,
}

def _get_blocking(cfg: dict, step: str) -> bool:
    step_cfg = cfg.get(step, {})
    if isinstance(step_cfg, dict):
        return step_cfg.get("blocking", _DEFAULT_BLOCKING.get(step, True))
    return _DEFAULT_BLOCKING.get(step, True)

_IS_WINDOWS = _platform.system() == "Windows"

_WIN_FALLBACKS = {
    "npm":  "npm.cmd",
    "npx":  "npx.cmd",
    "node": "node.exe",
    "yarn": "yarn.cmd",
    "pnpm": "pnpm.cmd",
}

def _resolve_cmd(cmd: list[str]) -> list[str]:
    if not _IS_WINDOWS or not cmd:
        return cmd
    exe = cmd[0]
    fallback = _WIN_FALLBACKS.get(exe)
    if fallback and shutil.which(fallback):
        return [fallback] + cmd[1:]
    return cmd

def _run_cmd(cmd: list[str], cwd: Path, timeout: int = 120) -> tuple[int, str]:
    if not cmd:
        return -1, ""
    cmd = _resolve_cmd(cmd)
    flags = subprocess.CREATE_NO_WINDOW if _IS_WINDOWS else 0
    try:
        proc = subprocess.Popen(
            cmd,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            creationflags=flags,
        )
        stdout, stderr = proc.communicate(timeout=timeout)
        return proc.returncode, f"{stdout or ''}{stderr or ''}".strip()
    except FileNotFoundError:
        return 127, f"Comando nao encontrado: {cmd[0]}"
    except subprocess.TimeoutExpired:
        proc.kill()
        stdout, stderr = proc.communicate()
        output = f"{stdout or ''}{stderr or ''}".strip()
        suffix = f"\n{output}" if output else ""
        return 124, f"Timeout apos {timeout}s{suffix}"
    except Exception as e:
        return 1, str(e)

def layer_git(project: Path, cfg: dict) -> StepResult:
    from .git import check_git
    git_cfg = cfg.get("git_check", {})
    require_clean = isinstance(git_cfg, dict) and git_cfg.get("require_clean", False)
    result = check_git(project, require_clean=require_clean)
    result.blocking = _get_blocking(cfg, "git_check")
    return result

def layer_quality_gates(project: Path, project_type: str, cfg: dict) -> StepResult:
    blocking = _get_blocking(cfg, "quality_gates")
    issues = []
    if project_type in ("node", "nextjs", "react"):
        npm_cmd = _resolve_cmd(["npm"])[0]
        if not shutil.which(npm_cmd):
            return StepResult("Quality Gates", Status.SKIPPED, "npm nao encontrado no PATH", blocking=blocking)
        code, out = _run_cmd(["npm", "run", "lint", "--", "--max-warnings=0"], project)
        if code == 127:
            return StepResult("Quality Gates", Status.SKIPPED, "script lint nao encontrado no package.json", blocking=blocking)
        if code != 0:
            issues.append(f"Lint: {out[:300]}")
        code2, out2 = _run_cmd(["npm", "run", "build"], project, timeout=300)
        if code2 == 127:
            pass
        elif code2 != 0:
            issues.append(f"Build: {out2[:200]}")
    elif project_type == "python":
        if shutil.which("flake8"):
            code, out = _run_cmd(["flake8", "--max-line-length=120", "--statistics"], project)
            if code != 0:
                issues.append(f"flake8: {out[:200]}")
        elif shutil.which("ruff"):
            code, out = _run_cmd(["ruff", "check", "."], project)
            if code != 0:
                issues.append(f"ruff: {out[:200]}")
        else:
            return StepResult("Quality Gates", Status.SKIPPED, "Nenhum linter Python encontrado (flake8/ruff)", blocking=blocking)
    else:
        return StepResult("Quality Gates", Status.SKIPPED, f"Quality gates nao configurados para {project_type}", blocking=blocking)
    if issues:
        return StepResult("Quality Gates", Status.FAIL, "; ".join(issues), blocking=blocking)
    return StepResult("Quality Gates", Status.PASS, "Lint e build OK")

def layer_unit_tests(project: Path, project_type: str, cfg: dict) -> StepResult:
    blocking = _get_blocking(cfg, "unit_tests")
    test_cmd = cfg.get("test_cmd") or _DEFAULT_TEST_CMD.get(project_type, [])
    if not test_cmd:
        return StepResult("Unit Tests", Status.SKIPPED, "test_cmd nao configurado", blocking=blocking)
    t0 = time.time()
    code, out = _run_cmd(test_cmd, project, timeout=180)
    duration = time.time() - t0
    if code == 127:
        return StepResult("Unit Tests", Status.SKIPPED, f"Runner nao encontrado: {test_cmd[0]}", blocking=blocking)
    if code != 0:
        return StepResult("Unit Tests", Status.FAIL, "Testes falharam", detail=out[-1000:], blocking=blocking, duration=duration)
    return StepResult("Unit Tests", Status.PASS, f"Passou em {duration:.1f}s", duration=duration)

def layer_integration_tests(project: Path, cfg: dict) -> StepResult:
    blocking = _get_blocking(cfg, "integration_tests")
    int_cmd = cfg.get("integration_cmd")
    if not int_cmd:
        return StepResult("Integration Tests", Status.SKIPPED, "integration_cmd nao configurado", blocking=blocking)
    t0 = time.time()
    code, out = _run_cmd(int_cmd, project, timeout=300)
    duration = time.time() - t0
    if code == 127:
        return StepResult("Integration Tests", Status.SKIPPED, "Runner nao encontrado", blocking=blocking)
    if code != 0:
        return StepResult("Integration Tests", Status.FAIL, "Testes de integracao falharam", detail=out[-1000:], blocking=blocking, duration=duration)
    return StepResult("Integration Tests", Status.PASS, f"Passou em {duration:.1f}s", duration=duration)

def layer_e2e_tests(project: Path, cfg: dict) -> StepResult:
    blocking = _get_blocking(cfg, "e2e_tests")
    e2e_cmd = cfg.get("e2e_cmd")
    if not e2e_cmd:
        return StepResult("E2E Tests", Status.SKIPPED, "e2e_cmd nao configurado", blocking=blocking)
    t0 = time.time()
    code, out = _run_cmd(e2e_cmd, project, timeout=600)
    duration = time.time() - t0
    if code == 127:
        return StepResult("E2E Tests", Status.SKIPPED, "Runner nao encontrado", blocking=blocking)
    if code != 0:
        return StepResult("E2E Tests", Status.FAIL, "Testes E2E falharam", detail=out[-1000:], blocking=blocking, duration=duration)
    return StepResult("E2E Tests", Status.PASS, f"Passou em {duration:.1f}s", duration=duration)

def layer_coverage(project: Path, project_type: str, cfg: dict) -> StepResult:
    blocking = _get_blocking(cfg, "coverage")
    threshold = cfg.get("coverage_threshold", 80)
    coverage_cmd = cfg.get("coverage_cmd")
    if coverage_cmd:
        t0 = time.time()
        code, out = _run_cmd(coverage_cmd, project, timeout=300)
        duration = time.time() - t0
        if code == 127:
            return StepResult("Coverage", Status.SKIPPED, "Runner de cobertura nao encontrado", blocking=blocking)
        if code != 0:
            return StepResult("Coverage", Status.FAIL, "Cobertura abaixo do minimo ou execucao falhou", detail=out[-1000:], blocking=blocking, duration=duration)
        return StepResult("Coverage", Status.PASS, f"Thresholds aprovados em {duration:.1f}s", duration=duration)
    if project_type == "python":
        if not shutil.which("coverage") and not shutil.which("pytest-cov"):
            return StepResult("Coverage", Status.SKIPPED, "coverage nao instalado", blocking=blocking)
        test_cmd = cfg.get("test_cmd") or ["python", "-m", "pytest"]
        cmd = test_cmd + [f"--cov=.", f"--cov-fail-under={threshold}", "--cov-report=term-missing"]
        code, out = _run_cmd(cmd, project, timeout=180)
        if code == 127:
            return StepResult("Coverage", Status.SKIPPED, "pytest nao disponivel", blocking=blocking)
        import re
        m = re.search(r"TOTAL\s+\d+\s+\d+\s+(\d+)%", out)
        pct = m.group(1) if m else "?"
        if code != 0:
            return StepResult("Coverage", Status.FAIL, f"Cobertura {pct}% (minimo {threshold}%)", blocking=blocking)
        return StepResult("Coverage", Status.PASS, f"Cobertura {pct}%")
    return StepResult("Coverage", Status.SKIPPED, f"Coverage nao configurado para {project_type}", blocking=blocking)

def layer_security(project: Path, project_type: str, cfg: dict) -> StepResult:
    from .security import scan_secrets
    blocking = _get_blocking(cfg, "security_scan")
    security_cmd = cfg.get("security_cmd")
    if security_cmd:
        t0 = time.time()
        code, out = _run_cmd(security_cmd, project, timeout=300)
        duration = time.time() - t0
        if code == 127:
            return StepResult("Security Scan", Status.SKIPPED, "Runner de seguranca nao encontrado", blocking=blocking)
        if code != 0:
            return StepResult("Security Scan", Status.FAIL, "Scan de seguranca falhou", detail=out[-1000:], blocking=blocking, duration=duration)
        return StepResult("Security Scan", Status.PASS, f"Aprovado em {duration:.1f}s", duration=duration)
    result = scan_secrets(project)
    result.blocking = blocking
    return result

def run_quick(project: Path, on_step: Callable | None = None) -> RunResult:
    cfg = load_devcheck_config(project)
    ptype = detect_project(project)
    result = RunResult("quick", str(project))
    steps = [
        lambda: layer_git(project, cfg),
        lambda: layer_quality_gates(project, ptype, cfg),
        lambda: layer_unit_tests(project, ptype, cfg),
    ]
    for fn in steps:
        step = fn()
        result.add(step)
        if on_step:
            on_step(step)
    return result

def run_full(project: Path, on_step: Callable | None = None) -> RunResult:
    cfg = load_devcheck_config(project)
    ptype = detect_project(project)
    result = RunResult("full", str(project))
    steps = [
        lambda: layer_git(project, cfg),
        lambda: layer_quality_gates(project, ptype, cfg),
        lambda: layer_unit_tests(project, ptype, cfg),
        lambda: layer_integration_tests(project, cfg),
        lambda: layer_e2e_tests(project, cfg),
        lambda: layer_coverage(project, ptype, cfg),
        lambda: layer_security(project, ptype, cfg),
    ]
    for fn in steps:
        step = fn()
        result.add(step)
        if on_step:
            on_step(step)

    final_git = layer_git(project, cfg)
    final_git.name = "Git Check Final"
    result.add(final_git)
    if on_step:
        on_step(final_git)

    return result

def run_approve(project: Path, on_step: Callable | None = None) -> RunResult:
    result = run_full(project, on_step)
    result.command = "approve"
    result.approved = all(s.status == Status.PASS for s in result.steps)
    return result

