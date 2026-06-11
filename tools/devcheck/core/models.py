from enum import Enum
from dataclasses import dataclass, field
from typing import Optional


class Status(str, Enum):
    PASS    = "PASS"
    FAIL    = "FAIL"
    WARN    = "WARN"
    SKIPPED = "SKIPPED"
    ERROR   = "ERROR"


STATUS_ICON = {
    Status.PASS:    "✅",
    Status.FAIL:    "❌",
    Status.WARN:    "⚠️",
    Status.SKIPPED: "⏭️",
    Status.ERROR:   "💥",
}


@dataclass
class StepResult:
    name: str
    status: Status
    message: str = ""
    detail: str = ""
    blocking: bool = True
    duration: float = 0.0

    @property
    def icon(self) -> str:
        return STATUS_ICON[self.status]

    @property
    def blocks_approve(self) -> bool:
        """True quando uma etapa obrigatoria nao passou integralmente."""
        return self.blocking and self.status != Status.PASS


@dataclass
class RunResult:
    command: str
    project: str
    steps: list[StepResult] = field(default_factory=list)
    approved: Optional[bool] = None

    def add(self, step: StepResult):
        self.steps.append(step)

    @property
    def overall(self) -> Status:
        statuses = [s.status for s in self.steps]
        if Status.ERROR in statuses:
            return Status.ERROR
        if any(s.blocks_approve for s in self.steps):
            return Status.FAIL
        if Status.WARN in statuses:
            return Status.WARN
        if all(s == Status.SKIPPED for s in statuses):
            return Status.SKIPPED
        return Status.PASS
