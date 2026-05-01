from unittest.mock import MagicMock
import sys


def mock_package(name):
    mock = MagicMock()
    mock.__path__ = []
    mock.__spec__ = None
    sys.modules[name] = mock
    return mock


mock_package("rclpy")
mock_package("auto_apms_interfaces")
mock_package("auto_apms_behavior_tree")
mock_package("auto_apms_behavior_tree_core")

mock_package("rclpy.action")
mock_package("rclpy.node")
mock_package("rclpy.executors")
mock_package("rclpy.callback_groups")
mock_package("auto_apms_interfaces.action")
mock_package("auto_apms_behavior_tree.resources")
mock_package("auto_apms_behavior_tree_core.resources")
mock_package("auto_apms_behavior_tree_core.tree")
mock_package("auto_apms_behavior_tree_core.tree.node_model")
