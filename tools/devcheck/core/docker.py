import shutil
from pathlib import Path
from .models import Status, StepResult


def run_docker_checks(project: Path) -> list[StepResult]:
    """
    Fase 2 — Docker é completamente opcional.
    Ausência de Docker sempre gera SKIPPED, nunca FAIL.
    """
    if not shutil.which("docker"):
        return [StepResult(
            "Docker Tests", Status.SKIPPED,
            "Docker não instalado — testes de container ignorados",
            blocking=False,
        )]

    r_info = __import__("subprocess").run(
        ["docker", "info"], capture_output=True, text=True
    )
    if r_info.returncode != 0:
        return [StepResult(
            "Docker Tests", Status.SKIPPED,
            "Docker instalado mas daemon inativo — testes ignorados",
            blocking=False,
        )]

    compose_file = project / "docker-compose.yml"
    if not compose_file.exists():
        return [StepResult(
            "Docker Tests", Status.SKIPPED,
            "docker-compose.yml não encontrado",
            blocking=False,
        )]

    # Placeholder para Fase 2
    return [StepResult(
        "Docker Tests", Status.SKIPPED,
        "Implementação completa prevista para Fase 2",
        blocking=False,
    )]
