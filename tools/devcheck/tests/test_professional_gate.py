import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from core.detector import load_devcheck_config
from core.git import _run as run_git
from core.models import RunResult, Status, StepResult
from core.runner import _run_cmd, layer_coverage, run_approve, run_full


class ProfessionalGateTests(unittest.TestCase):
    def test_command_output_accepts_none_streams(self):
        process = MagicMock()
        process.communicate.return_value = (None, None)
        process.returncode = 0

        with patch("core.runner.subprocess.Popen", return_value=process):
            code, output = _run_cmd(["example"], Path("."))

        self.assertEqual(code, 0)
        self.assertEqual(output, "")

    def test_timeout_kills_process_and_preserves_output(self):
        process = MagicMock()
        process.communicate.side_effect = [
            subprocess.TimeoutExpired(["example"], 1),
            ("partial stdout", None),
        ]

        with patch("core.runner.subprocess.Popen", return_value=process):
            code, output = _run_cmd(["example"], Path("."), timeout=1)

        self.assertEqual(code, 124)
        self.assertIn("Timeout apos 1s", output)
        self.assertIn("partial stdout", output)
        process.kill.assert_called_once()

    def test_blocking_non_pass_blocks_approval(self):
        self.assertTrue(StepResult("warning", Status.WARN, blocking=True).blocks_approve)
        self.assertTrue(StepResult("skip", Status.SKIPPED, blocking=True).blocks_approve)
        self.assertTrue(StepResult("error", Status.ERROR, blocking=True).blocks_approve)
        self.assertFalse(StepResult("pass", Status.PASS, blocking=True).blocks_approve)

    def test_overall_fails_when_blocking_step_is_skipped(self):
        result = RunResult("full", ".")
        result.add(StepResult("pass", Status.PASS, blocking=True))
        result.add(StepResult("skipped", Status.SKIPPED, blocking=True))

        self.assertEqual(result.overall, Status.FAIL)

    def test_approve_requires_every_step_to_pass(self):
        result = RunResult("full", ".")
        result.add(StepResult("optional warning", Status.WARN, blocking=False))

        with patch("core.runner.run_full", return_value=result):
            approved = run_approve(Path("."))

        self.assertFalse(approved.approved)

    def test_utf8_bom_config_is_supported(self):
        with tempfile.TemporaryDirectory() as directory:
            config = Path(directory) / "devcheck.json"
            config.write_text('{"security_scan": {"blocking": true}}', encoding="utf-8-sig")
            loaded = load_devcheck_config(Path(directory))

        self.assertTrue(loaded["security_scan"]["blocking"])

    def test_custom_coverage_command_is_blocking(self):
        cfg = {"coverage_cmd": ["npm", "run", "test:coverage"], "coverage": {"blocking": True}}

        with patch("core.runner._run_cmd", return_value=(1, "threshold failed")):
            result = layer_coverage(Path("."), "nextjs", cfg)

        self.assertEqual(result.status, Status.FAIL)
        self.assertTrue(result.blocking)

    def test_full_run_rechecks_git_after_all_layers(self):
        clean = StepResult("Git Check", Status.PASS)
        dirty = StepResult("Git Check", Status.FAIL, blocking=True)
        other = StepResult("Other", Status.PASS)

        with (
            patch("core.runner.load_devcheck_config", return_value={}),
            patch("core.runner.detect_project", return_value="nextjs"),
            patch("core.runner.layer_git", side_effect=[clean, dirty]) as git_check,
            patch("core.runner.layer_quality_gates", return_value=other),
            patch("core.runner.layer_unit_tests", return_value=other),
            patch("core.runner.layer_integration_tests", return_value=other),
            patch("core.runner.layer_e2e_tests", return_value=other),
            patch("core.runner.layer_coverage", return_value=other),
            patch("core.runner.layer_security", return_value=other),
        ):
            result = run_full(Path("."))

        self.assertEqual(git_check.call_count, 2)
        self.assertEqual(result.steps[-1].name, "Git Check Final")
        self.assertEqual(result.steps[-1].status, Status.FAIL)

    def test_git_commands_use_repo_scoped_safe_directory(self):
        completed = MagicMock(returncode=0, stdout="", stderr="")

        with patch("core.git.subprocess.run", return_value=completed) as subprocess_run:
            run_git(["git", "status", "--short"], Path("."))

        command = subprocess_run.call_args.args[0]
        self.assertEqual(command[0:2], ["git", "-c"])
        self.assertTrue(command[2].startswith("safe.directory="))


if __name__ == "__main__":
    unittest.main()
