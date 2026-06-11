from pathlib import Path
from ..core.logger import load_last, list_runs
from ..core.models import Status


_PROMPT_HEADER = """# DevCheck AI Report

Cole este relatório no Claude ou Codex para obter análise e sugestões de correção.

---

"""

_PROMPT_FOOTER = """
---

## Solicitação

Analise os resultados acima e:
1. Explique o que cada FAIL/WARN significa
2. Sugira como corrigir cada problema
3. Indique se é seguro fazer commit com os WARNs presentes
4. Liste as próximas ações em ordem de prioridade
"""


def generate_ai_report(project: Path) -> str:
    content = load_last(project)
    if not content:
        return "❌ Nenhuma execução encontrada. Rode `devcheck full` primeiro."

    runs = list_runs(project)
    history_note = f"(Histórico: {len(runs)} execuções registradas)\n\n" if runs else ""

    return _PROMPT_HEADER + history_note + "```\n" + content + "\n```" + _PROMPT_FOOTER


def save_ai_report(project: Path) -> Path:
    report = generate_ai_report(project)
    out = project / ".devcheck" / "ai-report.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(report, encoding="utf-8-sig")
    return out
