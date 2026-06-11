import json
from pathlib import Path


SIGNATURES = {
    "nextjs":  ["next.config.js", "next.config.ts", "next.config.mjs"],
    "react":   ["src/App.jsx", "src/App.tsx"],
    "node":    ["package.json"],
    "python":  ["pyproject.toml", "setup.py", "requirements.txt", "Pipfile"],
    "go":      ["go.mod"],
    "rust":    ["Cargo.toml"],
    "java":    ["pom.xml", "build.gradle"],
}


def detect_project(path: Path) -> str:
    for kind, files in SIGNATURES.items():
        if any((path / f).exists() for f in files):
            return kind
    return "generic"


def load_devcheck_config(path: Path) -> dict:
    """Carrega devcheck.json se existir, senão retorna config vazia."""
    cfg_file = path / "devcheck.json"
    if cfg_file.exists():
        with open(cfg_file, encoding="utf-8-sig") as f:
            return json.load(f)
    return {}


def resolve_project_path(arg: str | None) -> Path:
    """Resolve o caminho do projeto: usa arg se fornecido, senão cwd."""
    if arg:
        p = Path(arg).expanduser().resolve()
        if not p.exists():
            raise FileNotFoundError(f"Caminho não encontrado: {p}")
        return p
    return Path.cwd()
