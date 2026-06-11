import json
import threading
import time
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

from ..core.logger import load_last, list_runs
from ..core.models import STATUS_ICON

_HTML = (Path(__file__).parent / "html" / "index.html").read_text(encoding="utf-8")

# Subscribers SSE
_subscribers: list = []
_lock = threading.Lock()

# Último estado em memória
_state: dict = {}


def _parse_log(raw: str) -> dict:
    """Extrai steps e overall de um log texto."""
    steps = []
    overall = "SKIPPED"
    approved = None
    project = ""

    status_map = {"✅": "PASS", "❌": "FAIL", "⚠️": "WARN", "⏭️": "SKIPPED", "💥": "ERROR"}

    for line in raw.splitlines():
        # Projeto
        m = re.search(r"Projeto:\s*(.+)", line)
        if m:
            project = m.group(1).strip()

        # Step: "  ✅ PASS     Git Check  (1.2s)  mensagem"
        for icon, st in status_map.items():
            if icon in line and st in line:
                rest = re.sub(rf"[{re.escape(icon)}]\s*{re.escape(st)}\s*", "", line).strip()
                name_parts = rest.split("(")[0].strip()
                msg_m = re.search(r"\)\s*(.*)", rest)
                msg = msg_m.group(1).strip() if msg_m else ""
                if name_parts:
                    steps.append({"name": name_parts, "status": st, "message": msg})
                break

        # Overall
        m = re.search(r"Resultado geral:.*?(\w+)\s*$", line)
        if m:
            overall = m.group(1)

        if "APROVADO" in line and "REPROVADO" not in line:
            approved = True
        elif "REPROVADO" in line:
            approved = False

    return {"steps": steps, "overall": overall, "approved": approved,
            "raw_log": raw, "project": project}


def broadcast(data: dict):
    global _state
    _state = data
    msg = f"event: update\ndata: {json.dumps(data)}\n\n"
    with _lock:
        dead = []
        for q in _subscribers:
            try:
                q.put_nowait(msg)
            except Exception:
                dead.append(q)
        for q in dead:
            _subscribers.remove(q)


def _watch_log(project: Path):
    """Thread que monitora ultima-execucao.txt e faz broadcast ao mudar."""
    log_file = project / ".devcheck" / "logs" / "ultima-execucao.txt"
    last_mtime = 0.0
    while True:
        try:
            if log_file.exists():
                mtime = log_file.stat().st_mtime
                if mtime != last_mtime:
                    last_mtime = mtime
                    raw = log_file.read_text(encoding="utf-8")
                    state = _parse_log(raw)
                    state["history"] = _build_history(project)
                    broadcast(state)
        except Exception:
            pass
        time.sleep(1)


def _build_history(project: Path) -> list[dict]:
    runs = list_runs(project)[:20]
    result = []
    for f in runs:
        name = f.stem  # 20240101_120000_full
        parts = name.split("_", 2)
        ts = f"{parts[0][:4]}/{parts[0][4:6]}/{parts[0][6:]} {parts[1][:2]}:{parts[1][2:4]}" if len(parts) >= 2 else name
        cmd = parts[2] if len(parts) > 2 else "run"
        result.append({"filename": f.name, "command": cmd, "timestamp": ts, "project_name": project.name, "overall": "PASS"})
    return result


class Handler(BaseHTTPRequestHandler):
    project: Path = Path.cwd()

    def log_message(self, *args):
        pass  # silencia logs de acesso

    def do_GET(self):
        if self.path == "/":
            self._send(200, "text/html", _HTML.encode())

        elif self.path == "/api/state":
            raw = load_last(self.project)
            if raw:
                state = _parse_log(raw)
                state["history"] = _build_history(self.project)
            else:
                state = {"steps": [], "history": _build_history(self.project)}
            self._send(200, "application/json", json.dumps(state).encode())

        elif self.path.startswith("/api/log/"):
            fname = self.path[len("/api/log/"):]
            fpath = self.project / ".devcheck" / "logs" / fname
            if fpath.exists() and fpath.suffix == ".txt":
                self._send(200, "text/plain; charset=utf-8", fpath.read_bytes())
            else:
                self._send(404, "text/plain", b"Not found")

        elif self.path == "/events":
            import queue
            q: queue.Queue = queue.Queue(maxsize=50)
            with _lock:
                _subscribers.append(q)
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.end_headers()
            try:
                while True:
                    try:
                        msg = q.get(timeout=25)
                        self.wfile.write(msg.encode())
                        self.wfile.flush()
                    except Exception:
                        # heartbeat
                        self.wfile.write(b": keep-alive\n\n")
                        self.wfile.flush()
            except Exception:
                pass
            finally:
                with _lock:
                    if q in _subscribers:
                        _subscribers.remove(q)
        else:
            self._send(404, "text/plain", b"Not found")

    def _send(self, code: int, ctype: str, body: bytes):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def start_dashboard(project: Path, port: int = 5555):
    Handler.project = project

    # Inicia thread de monitoramento
    t = threading.Thread(target=_watch_log, args=(project,), daemon=True)
    t.start()

    server = HTTPServer(("0.0.0.0", port), Handler)
    return server
