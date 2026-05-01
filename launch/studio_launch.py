from ros2run.api import get_executable_path

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, ExecuteProcess
from launch.conditions import IfCondition
from launch.substitutions import EnvironmentVariable, LaunchConfiguration
from launch_ros.actions import Node

try:
    _START_WEB = get_executable_path(
        package_name="auto_apms_studio", executable_name="start_web"
    )
except Exception:
    _START_WEB = None

_START_BACKEND = get_executable_path(
    package_name="auto_apms_studio", executable_name="start_backend"
)


def generate_launch_description():
    declare_web_host = DeclareLaunchArgument(
        "web_host",
        default_value=EnvironmentVariable(
            "AUTO_APMS_STUDIO_WEB_HOST", default_value="0.0.0.0"
        ),
        description="Host for the web frontend server",
    )
    declare_web_port = DeclareLaunchArgument(
        "web_port",
        default_value=EnvironmentVariable(
            "AUTO_APMS_STUDIO_WEB_PORT", default_value="5173"
        ),
        description="Port for the web frontend server",
    )
    declare_backend_host = DeclareLaunchArgument(
        "backend_host",
        default_value=EnvironmentVariable(
            "AUTO_APMS_STUDIO_BACKEND_HOST", default_value="0.0.0.0"
        ),
        description="Host for the backend server",
    )
    declare_backend_port = DeclareLaunchArgument(
        "backend_port",
        default_value=EnvironmentVariable(
            "AUTO_APMS_STUDIO_BACKEND_PORT", default_value="8000"
        ),
        description="Port for the backend server",
    )
    declare_launch_executor = DeclareLaunchArgument(
        "launch_executor",
        default_value="false",
        description="Launch the auto_apms_behavior_tree tree_executor",
    )

    actions = [
        declare_backend_host,
        declare_backend_port,
        declare_launch_executor,
    ]

    if _START_WEB is not None:
        actions += [
            declare_web_host,
            declare_web_port,
            ExecuteProcess(
                cmd=[
                    _START_WEB,
                    "--host",
                    LaunchConfiguration("web_host"),
                    "--port",
                    LaunchConfiguration("web_port"),
                ],
                output="screen",
                emulate_tty=True,
                name="auto_apms_studio_web",
            ),
        ]

    actions += [
        ExecuteProcess(
            cmd=[
                _START_BACKEND,
                "--host",
                LaunchConfiguration("backend_host"),
                "--port",
                LaunchConfiguration("backend_port"),
            ],
            output="screen",
            emulate_tty=True,
            name="auto_apms_studio_backend",
        ),
        Node(
            package="auto_apms_behavior_tree",
            executable="tree_executor",
            output="screen",
            emulate_tty=True,
            exec_name="auto_apms_tree_executor",
            condition=IfCondition(LaunchConfiguration("launch_executor")),
        ),
    ]

    return LaunchDescription(actions)
