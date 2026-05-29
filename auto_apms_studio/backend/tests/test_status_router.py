from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from auto_apms_studio.backend.app.main import app


@patch("auto_apms_studio.backend.app.routers.status.get_node")
class TestStatusRouter:
    def test_status_sends_connected_with_executor(self, mock_get_node):
        mock_node = MagicMock()
        mock_node.get_node_names_and_namespaces.return_value = [
            ("tree_executor", "/"),
            ("auto_apms_studio_backend", "/"),
        ]
        mock_get_node.return_value = mock_node

        client = TestClient(app)
        with client.websocket_connect("/ws/v1/status") as ws:
            msg = ws.receive_json()
            assert msg["type"] == "status"
            assert msg["drone_connected"] is True
            assert msg["executor_available"] is True
            assert "ping_ms" in msg

    def test_status_sends_connected_without_executor(self, mock_get_node):
        mock_node = MagicMock()
        mock_node.get_node_names_and_namespaces.return_value = [
            ("auto_apms_studio_backend", "/"),
        ]
        mock_get_node.return_value = mock_node

        client = TestClient(app)
        with client.websocket_connect("/ws/v1/status") as ws:
            msg = ws.receive_json()
            assert msg["type"] == "status"
            assert msg["drone_connected"] is True
            assert msg["executor_available"] is False
