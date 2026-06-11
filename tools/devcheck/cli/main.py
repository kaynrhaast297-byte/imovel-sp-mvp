#!/usr/bin/env python3
"""
DevCheck CLI
Uso: devcheck <comando> [project_path]

Comandos:
  quick        Git + Quality Gates + Unit Tests
  full         Suite completa (7 camadas)
  approve      Full + decisão de commit
  security     Apenas security scan
  health       Diagnóstico do projeto
  ai-report    Gera relatório para colar no Claude/Codex
  dashboard    Abre dashboard em http://localhost:5555
  docker-setup Fase 2 (em breve)
"""
import sys
import argparse
import os
from pathlib import Path

if os.name == "nt":
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")

# Garante que o pacote é importável a partir de qualquer diretório
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from devcheck.core.detector import resolve_project_path, detect_project, load_devcheck_config
from devcheck.core.models import Status, STATUS_ICON
from devcheck.core.runner import run_quick, run_full, run_approve
from devcheck.core.logger import save_run


# ──────────────────────────────────────────────
# Output helpers
# ──────────────────────────────────────────────

def _sep(char="─", n=60):
    print(char * n)

def _header(cmd: str, project: Path):
    _sep("═")
    print(f"  ⚡ DEVCHECK — {cmd.upper()}")
    print(f"  Projeto : {project.name}")
    print(f"  Caminho : {project}")
    _sep("═")

def _print_step(step):
    icon = STATUS_ICON[step.status]
    dur = f"  ({step.duration:.1f}s)" if step.duration > 0 else ""
    print(f"  {icon} {step.status.value:<8} {step.name}{dur}")
    if step.message:
        print(f"           {step.message}")
    if step.detail:
        for line in step.detail.splitlines()[:3]:
            print(f"           > {line}")

def _print_result(result):
    _sep()
    overall = result.overall
    icon = STATUS_ICON[overall]
    print(f"\n  Resultado: {icon} {overall.value}")
    if result.approved is True:
        print("  ✅ APROVADO — seguro para commit e push")
    elif result.approved is False:
        print("  ❌ REPROVADO — corrija os erros antes de commitar")
    print()


# ──────────────────────────────────────────────
# Comandos
# ──────────────────────────────────────────────

def cmd_quick(project: Path):
    _header("quick", project)
    result = run_quick(project, on_step=_print_step)
    _print_result(result)
    save_run(project, result)
    return 0 if result.overall == Status.PASS else 1


def cmd_full(project: Path):
    _header("full", project)
    result = run_full(project, on_step=_print_step)
    _print_result(result)
    save_run(project, result)
    return 0 if result.overall == Status.PASS else 1


def cmd_approve(project: Path):
    _header("approve", project)
    result = run_approve(project, on_step=_print_step)
    _print_result(result)
    save_run(project, result)
    return 0 if result.approved else 1


def cmd_security(project: Path):
    _header("security", project)
    from devcheck.core.runner import layer_security
    from devcheck.core.models import RunResult
    ptype = detect_project(project)
    cfg = load_devcheck_config(project)
    result = RunResult("security", str(project))
    step = layer_security(project, ptype, cfg)
    result.add(step)
    _print_step(step)
    result.approved = step.status == Status.PASS
    _print_result(result)
    save_run(project, result)
    return 0 if result.approved else 1


def cmd_health(project: Path):
    _header("health", project)
    from devcheck.core.health import check_health
    from devcheck.core.models import RunResult
    ptype = detect_project(project)
    print(f"  Tipo detectado: {ptype}\n")
    result = RunResult("health", str(project))
    for step in check_health(project, ptype):
        result.add(step)
        _print_step(step)
    _print_result(result)
    save_run(project, result)
    return 0


def cmd_ai_report(project: Path):
    from devcheck.reports.ai_report import save_ai_report
    out = save_ai_report(project)
    print(f"\n  📋 Relatório salvo em: {out}")
    print("  Cole o conteúdo no Claude ou Codex para análise.\n")
    print("─" * 60)
    print(out.read_text(encoding="utf-8"))
    return 0


def cmd_dashboard(project: Path, port: int = 5555):
    from devcheck.dashboard.server import start_dashboard
    print(f"\n  🌐 Dashboard: http://localhost:{port}")
    print("  Ctrl+C para encerrar\n")
    server = start_dashboard(project, port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Dashboard encerrado.")
    return 0


def cmd_docker_setup(project: Path):
    print("\n  🐳 Docker Setup — Fase 2 (em breve)")
    print("  O DevCheck funciona 100% sem Docker.")
    print("  Sem Docker = SKIPPED, nunca FAIL.\n")
    return 0


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────

COMMANDS = {
    "quick":        cmd_quick,
    "full":         cmd_full,
    "approve":      cmd_approve,
    "security":     cmd_security,
    "health":       cmd_health,
    "ai-report":    cmd_ai_report,
    "docker-setup": cmd_docker_setup,
}


def main():
    parser = argparse.ArgumentParser(
        prog="devcheck",
        description="DevCheck — validação local antes do commit",
        add_help=True,
    )
    parser.add_argument("command", choices=list(COMMANDS.keys()) + ["dashboard"],
                        help="Comando a executar")
    parser.add_argument("project_path", nargs="?", default=None,
                        help="Caminho do projeto (opcional; default: diretório atual)")
    parser.add_argument("--port", type=int, default=5555,
                        help="Porta do dashboard (default: 5555)")
    args = parser.parse_args()

    try:
        project = resolve_project_path(args.project_path)
    except FileNotFoundError as e:
        print(f"\n  ❌ {e}\n")
        sys.exit(1)

    if args.command == "dashboard":
        sys.exit(cmd_dashboard(project, args.port))

    fn = COMMANDS[args.command]
    # ai-report e docker-setup não usam project como primeiro arg obrigatório
    sys.exit(fn(project))


if __name__ == "__main__":
    main()
