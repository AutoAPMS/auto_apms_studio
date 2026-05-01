from unittest.mock import patch, Mock

from auto_apms_studio.backend.app.adapters.autoapms import AutoAPMSLoader
from auto_apms_studio.backend.app.models.nodes import NodeType


class TestAutoAPMSNodeLoader:
    @patch(
        "auto_apms_studio.backend.app.adapters.autoapms.get_node_manifest_resource_identities",
        None,
    )
    def test_node_retrieval_failed_import(self):
        """Tests for loading a node unsuccessfully."""
        nodes = AutoAPMSLoader.get_all_nodes()
        assert nodes == []

    @patch(
        "auto_apms_studio.backend.app.adapters.autoapms.get_node_manifest_resource_identities"
    )
    @patch("auto_apms_studio.backend.app.adapters.autoapms.NodeManifestResource")
    @patch("auto_apms_studio.backend.app.adapters.autoapms.NodePortDirection")
    def test_get_all_nodes_success(
        self,
        mock_node_port_direction,
        mock_node_manifest_resource,
        mock_get_identities,
    ):
        """Tests for loading nodes successfully."""

        mock_identity = Mock()
        mock_identity.package_name = "example_package_name"
        mock_identity.metadata_id = "example_metadata_id"

        mock_get_identities.return_value = [mock_identity]

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
        mock_node_model.type = NodeType.ACTION
        mock_node_model.port_infos = [
            mock_input_port,
            mock_output_port,
            mock_inout_port,
        ]

        mock_manifest = Mock()

        mock_manifest.get_node_names.return_value = ["example_node_name"]

        mock_manifest.get_node_registration_options.return_value = {
            "class_name": "example_class_name",
            "description": "example description",
            "topic": "(input:example)",
            "port_alias": {"example_port_name": "example_port_alias"},
            "port_default": {"example_port_name": "example_port_default"},
            "wait_timeout": 1,
            "request_timeout": 1,
            "allow_unreachable": False,
            "logger_level": "example_logger_level",
            "extra": {"example_extra_key": "example_extra_value"},
        }

        mock_resource = Mock()
        mock_resource.node_manifest = mock_manifest
        mock_resource.node_model = {"example_node_name": mock_node_model}

        mock_node_manifest_resource.return_value = mock_resource

        nodes = AutoAPMSLoader.get_all_nodes()

        assert len(nodes) == 1
        node = nodes[0]
        assert node.node_name == "example_node_name"
        assert node.class_name == "example_class_name"
        assert node.description == "example description"
        assert node.topic == "(input:example)"
        assert node.package == "example_package_name"
        assert node.metadata_id == "example_metadata_id"

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
