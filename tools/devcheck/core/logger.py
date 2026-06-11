import datetime
from pathlib import Path
from .models import RunResult, Status, STATUS_ICON


def _logs_dir(project: Path) -> Path:
    d = project / ".devcheck" / "logs"
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_run(project: Path, result: RunResult) -> Path:
    """Salva o log da execução e atualiza ultima-execucao.txt."""
    logs = _logs_dir(project)
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{ts}_{result.command}.txt"

    content = _format_log(result)

    # Log com timestamp
    (logs / filename).write_text(content, encoding="utf-8-sig")

    # Sempre atualiza ultima-execucao.txt
    (logs / "ultima-execucao.txt").write_text(content, encoding="utf-8-sig")

    return logs / filename


def _format_log(result: RunResult) -> str:
    now = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    lines = [
        "═" * 60,
        f"  DEVCHECK — {result.command.upper()}",
        f"  {now}",
        f"  Projeto: {result.project}",
        "═" * 60,
        "",
    ]

    for step in result.steps:
        icon = STATUS_ICON[step.status]
        dur = f"  ({step.duration:.1f}s)" if step.duration > 0 else ""
        lines.append(f"  {icon} {step.status.value:<8} {step.name}{dur}")
        if step.message:
            lines.append(f"           {step.message}")
        if step.detail:
            for dl in step.detail.splitlines()[:5]:
                lines.append(f"           > {dl}")

    lines += ["", "─" * 60]

    overall = result.overall
    icon = STATUS_ICON[overall]
    lines.append(f"  Resultado geral: {icon} {overall.value}")

    if result.approved is not None:
        if result.approved:
            lines.append("  ✅ APROVADO — seguro para commit")
        else:
            lines.append("  ❌ REPROVADO — corrija os erros antes de commitar")

    lines += ["─" * 60, ""]
    return "\n".join(lines)


def load_last(project: Path) -> str | None:
    f = _logs_dir(project) / "ultima-execucao.txt"
    if f.exists():
        return f.read_text(encoding="utf-8-sig")
    return None


def list_runs(project: Path) -> list[Path]:
    logs = _logs_dir(project)
    return sorted(
        [f for f in logs.glob("*.txt") if f.name != "ultima-execucao.txt"],
        reverse=True,
    )
