from unittest.mock import patch, Mock

from auto_apms_studio.backend.app.adapters.cpp_nodes import NativeTreeLoader


class TestBTCPPNodes:
    @patch(
        "auto_apms_studio.backend.app.adapters.cpp_nodes.get_native_node_model", None
    )
    def test_node_retrieval_failed_import(self):
        """Tests for loading a node unsuccessfully."""
        nodes = NativeTreeLoader.get_all_nodes()
        assert nodes == []

    @patch("auto_apms_studio.backend.app.adapters.cpp_nodes.get_native_node_model")
    @patch("auto_apms_studio.backend.app.adapters.cpp_nodes.NodePortDirection")
    def test_get_all_nodes_success_default(
        self,
        mock_node_port_direction,
        mock_get_native_node_model,
    ):
        """Tests for loading nodes successfully."""

        mock_identity = Mock()
        mock_identity.package = "example_package_name"
        mock_identity.metadata_id = "example_metadata_id"

        mock_node_port_direction.INPUT = "INPUT"
        mock_node_port_direction.OUTPUT = "OUTPUT"
        mock_node_port_direction.INOUT = "INOUT"

        mock_port_info = Mock()
        mock_port_info.port_name = "example_port_name"
        mock_port_info.port_type = "example_port_type"
        mock_port_info.port_default = "example_port_default"
        mock_port_info.port_has_default = False
        mock_port_info.port_description = "example_port_description"
        mock_port_info.port_direction = "INPUT"

        mock_node_model = Mock()
        mock_node_model.type = "NodeType.ACTION"
        mock_node_model.port_infos = [mock_port_info]

        mock_get_native_node_model.return_value = {"example_node_name": mock_node_model}

        nodes = NativeTreeLoader.get_all_nodes()

        assert len(nodes) == 1
        node = nodes[0]
        assert node.node_name == "example_node_name"
        assert node.package == "BehaviorTree.CPP"
        assert node.metadata_id == ""
        assert node.node_type == "NodeType.ACTION"

        assert len(node.input_ports) == 1
        assert node.input_ports[0].name == "example_port_name"
        assert node.input_ports[0].type == "example_port_type"
        assert node.input_ports[0].default == "example_port_default"
        assert node.input_ports[0].has_default == False
        assert node.input_ports[0].description == "example_port_description"

        assert len(node.output_ports) == 0
        assert len(node.input_output_ports) == 0

    @patch("auto_apms_studio.backend.app.adapters.cpp_nodes.get_native_node_model")
    @patch("auto_apms_studio.backend.app.adapters.cpp_nodes.NodePortDirection")
    def test_get_all_nodes_success_non_default(
        self,
        mock_node_port_direction,
        mock_get_native_node_model,
    ):
        """Tests for loading nodes successfully."""

        mock_identity = Mock()
        mock_identity.package = "example_package_name"
        mock_identity.metadata_id = "example_metadata_id"

        mock_node_port_direction.INPUT = "INPUT"
        mock_node_port_direction.OUTPUT = "OUTPUT"
        mock_node_port_direction.INOUT = "INOUT"

        mock_input_port = Mock()
        mock_input_port.port_name = "example_port_name"
        mock_input_port.port_type = "example_port_type"
        mock_input_port.port_default = "example_port_default"
        mock_input_port.port_has_default = True
        mock_input_port.port_description = "example_port_description"
        mock_input_port.port_direction = "INPUT"

        mock_output_port = Mock()
        mock_output_port.port_name = "example_port_name_2"
        mock_output_port.port_type = "example_port_type_2"
        mock_output_port.port_default = None
        mock_output_port.port_has_default = False
        mock_output_port.port_description = "example_port_description_2"
        mock_output_port.port_direction = "OUTPUT"

        mock_inout_port = Mock()
        mock_inout_port.port_name = "example_port_name_3"
        mock_inout_port.port_type = "example_port_type_3"
        mock_inout_port.port_default = None
        mock_inout_port.port_has_default = False
        mock_inout_port.port_description = "example_port_description_3"
        mock_inout_port.port_direction = "INOUT"

        mock_node_model = Mock()
        mock_node_model.type = "NodeType.ACTION"
        mock_node_model.port_infos = [
            mock_input_port,
            mock_output_port,
            mock_inout_port,
        ]

        mock_get_native_node_model.return_value = {"example_node_name": mock_node_model}

        nodes = NativeTreeLoader.get_all_nodes()

        assert len(nodes) == 1
        node = nodes[0]
        assert node.node_name == "example_node_name"
        assert node.package == "BehaviorTree.CPP"
        assert node.metadata_id == ""
        assert node.node_type == "NodeType.ACTION"

        assert len(node.input_ports) == 1
        input_port = node.input_ports[0]
        assert input_port.name == "example_port_name"
        assert input_port.type == "example_port_type"
        assert input_port.default == "example_port_default"
        assert input_port.has_default is True
        assert input_port.description == "example_port_description"

        assert len(node.output_ports) == 1
        output_port = node.output_ports[0]
        assert output_port.name == "example_port_name_2"
        assert output_port.type == "example_port_type_2"
        assert output_port.default == ""
        assert output_port.has_default is False
        assert output_port.description == "example_port_description_2"

        assert len(node.input_output_ports) == 1
        inout_port = node.input_output_ports[0]
        assert inout_port.name == "example_port_name_3"
        assert inout_port.type == "example_port_type_3"
        assert inout_port.default == ""
        assert inout_port.has_default is False
        assert inout_port.description == "example_port_description_3"
