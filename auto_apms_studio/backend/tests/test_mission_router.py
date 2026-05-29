import json
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from auto_apms_studio.backend.app.main import app


def _make_done_future(result, exception=None):
    """Create a mock rclpy future that immediately fires add_done_callback."""
    future = MagicMock()
    future.done.return_value = True
    future.result.return_value = result
    future.exception.return_value = exception

    def _add_cb(cb):
        cb(future)

    future.add_done_callback = _add_cb
    return future


@patch("auto_apms_studio.backend.app.routers.mission.get_node")
@patch("auto_apms_studio.backend.app.routers.mission.ActionClient")
class TestMissionRouter:
    def test_executor_not_available(self, mock_ac_cls, mock_get_node):
        mock_get_node.return_value = MagicMock()
        mock_ac = MagicMock()
        mock_ac.wait_for_server.return_value = False
        mock_ac_cls.return_value = mock_ac

        client = TestClient(app)
        with client.websocket_connect("/ws/v1/mission") as ws:
            ws.send_text(json.dumps({"build_request": "<root/>"}))
            msg1 = ws.receive_json()
            assert msg1["type"] == "status"
            msg2 = ws.receive_json()
            assert msg2["type"] == "error"
            assert "Tree Executor not available" in msg2["message"]

    def test_goal_rejected(self, mock_ac_cls, mock_get_node):
        mock_get_node.return_value = MagicMock()
        mock_ac = MagicMock()
        mock_ac.wait_for_server.return_value = True

        goal_handle = MagicMock()
        goal_handle.accepted = False
        mock_ac.send_goal_async.return_value = _make_done_future(goal_handle)
        mock_ac_cls.return_value = mock_ac

        client = TestClient(app)
        with client.websocket_connect("/ws/v1/mission") as ws:
            ws.send_text(json.dumps({"build_request": "<root/>"}))
            messages = [ws.receive_json() for _ in range(3)]
            types = [m["type"] for m in messages]
            assert "error" in types
            error_msg = next(m for m in messages if m["type"] == "error")
            assert "Goal rejected" in error_msg["message"]

    def test_mission_success(self, mock_ac_cls, mock_get_node):
        mock_get_node.return_value = MagicMock()
        mock_ac = MagicMock()
        mock_ac.wait_for_server.return_value = True

        result = MagicMock()
        result.tree_result = 1
        result.terminated_tree_identity = "my_tree"
        result.message = "Done"

        result_wrapper = MagicMock()
        result_wrapper.result = result

        goal_handle = MagicMock()
        goal_handle.accepted = True
        goal_handle.get_result_async.return_value = _make_done_future(result_wrapper)

        mock_ac.send_goal_async.return_value = _make_done_future(goal_handle)
        mock_ac_cls.return_value = mock_ac

        client = TestClient(app)
        with client.websocket_connect("/ws/v1/mission") as ws:
            ws.send_text(json.dumps({"build_request": "<root/>"}))
            messages = [ws.receive_json() for _ in range(4)]
            result_msg = next(m for m in messages if m["type"] == "result")
            assert result_msg["tree_result"] == "SUCCESS"
            assert result_msg["tree_identity"] == "my_tree"

    def test_mission_failure_result(self, mock_ac_cls, mock_get_node):
        mock_get_node.return_value = MagicMock()
        mock_ac = MagicMock()
        mock_ac.wait_for_server.return_value = True

        result = MagicMock()
        result.tree_result = 2
        result.terminated_tree_identity = "my_tree"
        result.message = "Failed"

        result_wrapper = MagicMock()
        result_wrapper.result = result

        goal_handle = MagicMock()
        goal_handle.accepted = True
        goal_handle.get_result_async.return_value = _make_done_future(result_wrapper)

        mock_ac.send_goal_async.return_value = _make_done_future(goal_handle)
        mock_ac_cls.return_value = mock_ac

        client = TestClient(app)
        with client.websocket_connect("/ws/v1/mission") as ws:
            ws.send_text(json.dumps({"build_request": "<root/>"}))
            messages = [ws.receive_json() for _ in range(4)]
            result_msg = next(m for m in messages if m["type"] == "result")
            assert result_msg["tree_result"] == "FAILURE"

    def test_exception_sends_error(self, mock_ac_cls, mock_get_node):
        mock_get_node.return_value = MagicMock()
        mock_ac = MagicMock()
        mock_ac.wait_for_server.side_effect = Exception("Unexpected error")
        mock_ac_cls.return_value = mock_ac

        client = TestClient(app)
        with client.websocket_connect("/ws/v1/mission") as ws:
            ws.send_text(json.dumps({"build_request": "<root/>"}))
            ws.receive_json()
            msg = ws.receive_json()
            assert msg["type"] == "error"
            assert "Unexpected error" in msg["message"]

    def test_unknown_tree_result(self, mock_ac_cls, mock_get_node):
        mock_get_node.return_value = MagicMock()
        mock_ac = MagicMock()
        mock_ac.wait_for_server.return_value = True

        result = MagicMock()
        result.tree_result = 99
        result.terminated_tree_identity = "my_tree"
        result.message = "?"

        result_wrapper = MagicMock()
        result_wrapper.result = result

        goal_handle = MagicMock()
        goal_handle.accepted = True
        goal_handle.get_result_async.return_value = _make_done_future(result_wrapper)

        mock_ac.send_goal_async.return_value = _make_done_future(goal_handle)
        mock_ac_cls.return_value = mock_ac

        client = TestClient(app)
        with client.websocket_connect("/ws/v1/mission") as ws:
            ws.send_text(json.dumps({"build_request": "<root/>"}))
            messages = [ws.receive_json() for _ in range(4)]
            result_msg = next(m for m in messages if m["type"] == "result")
            assert result_msg["tree_result"] == "UNKNOWN"

    def test_load_manifests_exception_logs_warning(self, mock_ac_cls, mock_get_node):
        mock_node = MagicMock()
        mock_get_node.return_value = mock_node
        mock_ac = MagicMock()
        mock_ac.wait_for_server.return_value = True

        result = MagicMock()
        result.tree_result = 1
        result.terminated_tree_identity = "my_tree"
        result.message = "Done"

        result_wrapper = MagicMock()
        result_wrapper.result = result

        goal_handle = MagicMock()
        goal_handle.accepted = True
        goal_handle.get_result_async.return_value = _make_done_future(result_wrapper)

        mock_ac.send_goal_async.return_value = _make_done_future(goal_handle)
        mock_ac_cls.return_value = mock_ac

        with patch(
            "auto_apms_behavior_tree_core.resources.NodeManifestResource",
            side_effect=Exception("load error"),
        ):
            client = TestClient(app)
            with client.websocket_connect("/ws/v1/mission") as ws:
                ws.send_text(
                    json.dumps(
                        {"build_request": "<root/>", "node_manifest": "some::identity"}
                    )
                )
                messages = [ws.receive_json() for _ in range(4)]
                mock_node.get_logger().warning.assert_called()
