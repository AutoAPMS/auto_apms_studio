import os
import signal
import subprocess
import sys
import time

from ros2run.api import get_executable_path

from auto_apms_ros2behavior.verb import VerbExtension

try:
    _START_WEB = get_executable_path(
        package_name="auto_apms_studio", executable_name="start_web"
    )
except Exception:
    _START_WEB = None

_START_BACKEND = get_executable_path(
    package_name="auto_apms_studio", executable_name="start_backend"
)


class StudioVerb(VerbExtension):
    """Launch AutoAPMS Studio components."""

    def add_arguments(self, parser, cli_name):
        parser.add_argument(
            "--no-backend",
            action="store_true",
            help="Do not launch the backend server.",
        )
        parser.add_argument(
            "--backend-host",
            default=os.environ.get("AUTO_APMS_STUDIO_BACKEND_HOST", "0.0.0.0"),
            metavar="HOST",
            help="Host for the backend server (default: %(default)s).",
        )
        parser.add_argument(
            "--backend-port",
            default=os.environ.get("AUTO_APMS_STUDIO_BACKEND_PORT", "8000"),
            metavar="PORT",
            help="Port for the backend server (default: %(default)s).",
        )
        if _START_WEB is not None:
            parser.add_argument(
                "--no-frontend",
                action="store_true",
                help="Do not launch the web frontend server.",
            )
            parser.add_argument(
                "--frontend-host",
                default=os.environ.get("AUTO_APMS_STUDIO_WEB_HOST", "0.0.0.0"),
                metavar="HOST",
                help="Host for the web frontend server (default: %(default)s).",
            )
            parser.add_argument(
                "--frontend-port",
                default=os.environ.get("AUTO_APMS_STUDIO_WEB_PORT", "5173"),
                metavar="PORT",
                help="Port for the web frontend server (default: %(default)s).",
            )
        parser.add_argument(
            "--launch-executor",
            action="store_true",
            help="Launch a tree executor node together with the other processes.",
        )

    def main(self, *, args):
        processes = []

        def _terminate_all():
            for p in processes:
                if p.poll() is None:
                    p.terminate()
            for p in processes:
                try:
                    p.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    p.kill()

        def _signal_handler(signum, frame):
            _terminate_all()
            sys.exit(0)

        signal.signal(signal.SIGINT, _signal_handler)
        signal.signal(signal.SIGTERM, _signal_handler)

        launch_frontend = _START_WEB is not None and not getattr(
            args, "no_frontend", False
        )
        launch_backend = not args.no_backend

        _BLUE = "\033[94m"
        _BOLD = "\033[1m"
        _DIM = "\033[2m"
        _RESET = "\033[0m"

        def _url(host, port):
            return f"{_BLUE}http://{host}:{port}{_RESET}"

        def _disabled(reason):
            return f"{_DIM}{reason}{_RESET}"

        rows = []
        rows.append(
            (
                "Backend",
                _url(args.backend_host, args.backend_port)
                if launch_backend
                else _disabled("disabled"),
            )
        )
        if _START_WEB is not None:
            rows.append(
                (
                    "Frontend",
                    _url(args.frontend_host, args.frontend_port)
                    if launch_frontend
                    else _disabled("disabled"),
                )
            )
        else:
            rows.append(("Frontend", _disabled("not built")))
        rows.append(
            (
                "Executor",
                f"{_BLUE}enabled{_RESET}"
                if args.launch_executor
                else _disabled("disabled"),
            )
        )

        label_width = max(len(label) for label, _ in rows)
        sep = f"{_BLUE}{'─' * 32}{_RESET}"
        print(f"\n{_BOLD}{_BLUE}  AutoAPMS Studio{_RESET}")
        print(sep)
        for label, value in rows:
            print(f"  {_BOLD}{label:<{label_width}}{_RESET}  {value}")
        print(f"{sep}\n")

        if launch_frontend:
            processes.append(
                subprocess.Popen(
                    [
                        _START_WEB,
                        "--host",
                        args.frontend_host,
                        "--port",
                        args.frontend_port,
                    ]
                )
            )

        if launch_backend:
            processes.append(
                subprocess.Popen(
                    [
                        _START_BACKEND,
                        "--host",
                        args.backend_host,
                        "--port",
                        args.backend_port,
                    ]
                )
            )

        if args.launch_executor:
            processes.append(
                subprocess.Popen(
                    ["ros2", "run", "auto_apms_behavior_tree", "tree_executor"]
                )
            )

        if not processes:
            print("No components selected for launch.")
            return 0

        try:
            while True:
                for p in processes:
                    ret = p.poll()
                    if ret is not None and ret != 0:
                        _terminate_all()
                        return ret
                if all(p.poll() is not None for p in processes):
                    break
                time.sleep(0.1)
        except KeyboardInterrupt:
            _terminate_all()

        return 0
