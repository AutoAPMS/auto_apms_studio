import asyncio
from unittest.mock import MagicMock, patch


class TestInitRosNode:
    def test_init_calls_rclpy_init_when_not_ok(self):
        loop = asyncio.new_event_loop()
        mock_task = MagicMock()

        with (
            patch("auto_apms_studio.backend.app.adapters.ros_node.rclpy") as mock_rclpy,
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node.Node"
            ) as mock_node_cls,
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node.SingleThreadedExecutor"
            ) as mock_executor_cls,
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node.asyncio"
            ) as mock_asyncio,
            patch("auto_apms_studio.backend.app.adapters.ros_node._node", None),
            patch("auto_apms_studio.backend.app.adapters.ros_node._executor", None),
        ):
            mock_rclpy.ok.return_value = False
            mock_node = MagicMock()
            mock_node_cls.return_value = mock_node
            mock_executor = MagicMock()
            mock_executor_cls.return_value = mock_executor
            mock_loop = MagicMock()
            mock_loop.create_task.return_value = mock_task
            mock_asyncio.get_running_loop.return_value = mock_loop

            from auto_apms_studio.backend.app.adapters.ros_node import init_ros_node

            init_ros_node()

            mock_rclpy.init.assert_called_once()
            mock_node_cls.assert_called_once_with("auto_apms_studio_backend")
            mock_executor.add_node.assert_called_once_with(mock_node)
            mock_loop.create_task.assert_called_once()

    def test_init_skips_rclpy_init_when_already_ok(self):
        mock_task = MagicMock()

        with (
            patch("auto_apms_studio.backend.app.adapters.ros_node.rclpy") as mock_rclpy,
            patch("auto_apms_studio.backend.app.adapters.ros_node.Node"),
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node.SingleThreadedExecutor"
            ),
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node.asyncio"
            ) as mock_asyncio,
            patch("auto_apms_studio.backend.app.adapters.ros_node._node", None),
            patch("auto_apms_studio.backend.app.adapters.ros_node._executor", None),
        ):
            mock_rclpy.ok.return_value = True
            mock_loop = MagicMock()
            mock_loop.create_task.return_value = mock_task
            mock_asyncio.get_running_loop.return_value = mock_loop

            from auto_apms_studio.backend.app.adapters.ros_node import init_ros_node

            init_ros_node()

            mock_rclpy.init.assert_not_called()

    def test_init_skips_node_creation_when_already_initialized(self):
        mock_existing_node = MagicMock()

        with (
            patch("auto_apms_studio.backend.app.adapters.ros_node.rclpy") as mock_rclpy,
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node.Node"
            ) as mock_node_cls,
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node._node",
                mock_existing_node,
            ),
        ):
            mock_rclpy.ok.return_value = True

            from auto_apms_studio.backend.app.adapters.ros_node import init_ros_node

            init_ros_node()

            mock_node_cls.assert_not_called()


class TestShutdownRosNode:
    def test_shutdown_destroys_node_and_shuts_down_rclpy(self):
        mock_node = MagicMock()
        mock_executor = MagicMock()
        mock_task = MagicMock()

        with (
            patch("auto_apms_studio.backend.app.adapters.ros_node.rclpy") as mock_rclpy,
            patch("auto_apms_studio.backend.app.adapters.ros_node._node", mock_node),
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node._executor",
                mock_executor,
            ),
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node._spin_task", mock_task
            ),
        ):
            mock_rclpy.ok.return_value = True

            from auto_apms_studio.backend.app.adapters.ros_node import shutdown_ros_node

            shutdown_ros_node()

            mock_task.cancel.assert_called_once()
            mock_executor.shutdown.assert_called_once()
            mock_node.destroy_node.assert_called_once()
            mock_rclpy.shutdown.assert_called_once()

    def test_shutdown_skips_rclpy_shutdown_when_not_ok(self):
        mock_node = MagicMock()
        mock_executor = MagicMock()

        with (
            patch("auto_apms_studio.backend.app.adapters.ros_node.rclpy") as mock_rclpy,
            patch("auto_apms_studio.backend.app.adapters.ros_node._node", mock_node),
            patch(
                "auto_apms_studio.backend.app.adapters.ros_node._executor",
                mock_executor,
            ),
            patch("auto_apms_studio.backend.app.adapters.ros_node._spin_task", None),
        ):
            mock_rclpy.ok.return_value = False

            from auto_apms_studio.backend.app.adapters.ros_node import shutdown_ros_node

            shutdown_ros_node()

            mock_rclpy.shutdown.assert_not_called()

    def test_shutdown_is_safe_when_not_initialized(self):
        with (
            patch("auto_apms_studio.backend.app.adapters.ros_node.rclpy") as mock_rclpy,
            patch("auto_apms_studio.backend.app.adapters.ros_node._node", None),
            patch("auto_apms_studio.backend.app.adapters.ros_node._executor", None),
            patch("auto_apms_studio.backend.app.adapters.ros_node._spin_task", None),
        ):
            mock_rclpy.ok.return_value = False

            from auto_apms_studio.backend.app.adapters.ros_node import shutdown_ros_node

            shutdown_ros_node()  # should not raise


class TestGetNode:
    def test_get_node_returns_initialized_node(self):
        mock_node = MagicMock()

        with patch("auto_apms_studio.backend.app.adapters.ros_node._node", mock_node):
            from auto_apms_studio.backend.app.adapters.ros_node import get_node

            result = get_node()
            assert result == mock_node

    def test_get_node_raises_when_not_initialized(self):
        with patch("auto_apms_studio.backend.app.adapters.ros_node._node", None):
            from auto_apms_studio.backend.app.adapters.ros_node import get_node

            try:
                get_node()
                assert False, "Expected RuntimeError"
            except RuntimeError as e:
                assert "not initialized" in str(e)
