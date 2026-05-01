from fastapi.testclient import TestClient
from unittest.mock import patch

from auto_apms_studio.backend.app.main import app
from auto_apms_studio.backend.app.models.nodes import NodeModel, Port, NodeType


class TestNodesRouter:
    """
    Tests for the /api/v1/node_modules endpoint which retrieves
    node models from both AutoAPMS and native BehaviorTree.CPP sources.
    """

    @patch("auto_apms_studio.backend.app.routers.nodes.NativeTreeLoader.get_all_nodes")
    @patch("auto_apms_studio.backend.app.routers.nodes.AutoAPMSLoader.get_all_nodes")
    def test_get_all_nodes(self, mock_autoapms_loader, mock_native_loader):
        """
        Test that endpoint returns 500 if both loaders return empty lists.
        """
        mock_autoapms_loader.return_value = []
        mock_native_loader.return_value = []

        client = TestClient(app)
        response = client.get("/api/v1/node_modules")
        data = response.json()

        assert response.status_code == 500
        assert "detail" in data
        assert "Node model retrieval failed." in data["detail"]

    @patch("auto_apms_studio.backend.app.routers.nodes.NativeTreeLoader.get_all_nodes")
    @patch("auto_apms_studio.backend.app.routers.nodes.AutoAPMSLoader.get_all_nodes")
    def test_get_all_nodes_returns_combined_list(
        self,
        mock_autoapms_loader,
        mock_native_loader,
    ):
        """
        This test emulates two nodes from each the AutoAPMS node model registry, alongside
        the BehaviorTree.CPP node model registry, to verify that the endpoint correctly combines
        and returns nodes from both sources.

        The test will return a successful '200' response alongside the two mocked node models.
        """
        autoapms_node = NodeModel(
            node_name="autoapms_default",
            class_name="AutoAPMSDefaultNode",
            package="auto_apms",
            metadata_id="test_id",
            pid="auto_apms::test_id",
            node_type=NodeType.ACTION,
            input_ports=[],
            output_ports=[],
            input_output_ports=[],
            description="An example AutoAPMS node",
            topic="",
            port_alias={},
            port_default={},
            hidden_ports=[],
            wait_timeout=None,
            request_timeout=None,
            allow_unreachable=None,
            logger_level="",
            extra=None,
        )

        native_node = NodeModel(
            node_name="native_node_name",
            class_name="native_node_class",
            package="BehaviorTree.CPP",
            metadata_id="",
            pid="BehaviorTree.CPP",
            node_type=NodeType.ACTION,
            input_ports=[
                Port(
                    name="example_port",
                    type="string",
                    default="",
                    has_default=False,
                    description="Example port",
                )
            ],
            output_ports=[],
            input_output_ports=[],
            description="",
            topic="",
            port_alias={},
            port_default={},
            hidden_ports=[],
            wait_timeout=None,
            request_timeout=None,
            allow_unreachable=None,
            logger_level="",
            extra=None,
        )

        mock_autoapms_loader.return_value = [autoapms_node]
        mock_native_loader.return_value = [native_node]

        client = TestClient(app)
        response = client.get("/api/v1/node_modules")

        assert response.status_code == 200
        data = response.json()

        assert "nodes" in data
        assert len(data["nodes"]) == 2

        node_names = [node["node_name"] for node in data["nodes"]]
        assert "autoapms_default" in node_names
        assert "native_node_name" in node_names
