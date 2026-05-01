from auto_apms_studio.backend.app.models.nodes import NodeModel, Port, NodeType
import logging

logger = logging.getLogger(__name__)

try:
    from auto_apms_behavior_tree_core.resources import (
        get_node_manifest_resource_identities,
        NodeManifestResource,
    )
    from auto_apms_behavior_tree_core.tree.node_model import NodePortDirection

    logger.info("AutoAPMSLoader: Successfully imported AutoAPMS modules.")
except ImportError:
    logger.error("AutoAPMSLoader: Failed to import AutoAPMS modules.")
    get_node_manifest_resource_identities = None
    NodeManifestResource = None
    NodePortDirection = None


class AutoAPMSLoader:
    """Imports and converts AutoAPMS node models to the internal NodeModel format."""

    @staticmethod
    def get_all_nodes() -> list[NodeModel]:
        if not get_node_manifest_resource_identities:
            logger.warning(
                "AutoAPMSLoader: get_node_manifest_resource_identities function is not available."
            )
            return []

        identities = get_node_manifest_resource_identities()
        nodes = []

        for identity in identities:
            resource = NodeManifestResource(identity)
            manifest = resource.node_manifest
            node_model_map = resource.node_model

            for node_name in manifest.get_node_names():
                if node_name not in node_model_map:
                    continue

                ext_node_model = node_model_map[node_name]
                options = manifest.get_node_registration_options(node_name)

                input_ports: list[Port] = []
                output_ports: list[Port] = []
                input_output_ports: list[Port] = []

                for port_info in ext_node_model.port_infos:
                    port = Port(
                        name=str(port_info.port_name),
                        type=str(port_info.port_type),
                        default=str(port_info.port_default or ""),
                        has_default=port_info.port_has_default,
                        description=str(port_info.port_description or ""),
                    )

                    if port_info.port_direction == NodePortDirection.INPUT:
                        input_ports.append(port)
                    elif port_info.port_direction == NodePortDirection.OUTPUT:
                        output_ports.append(port)
                    elif port_info.port_direction == NodePortDirection.INOUT:
                        input_output_ports.append(port)

                package = str(identity.package_name)
                metadata_id = str(identity.metadata_id)
                pid = package + "::" + metadata_id

                nodes.append(
                    NodeModel(
                        node_name=node_name,
                        class_name=options.get("class_name", ""),
                        description=options.get("description", ""),
                        topic=options.get("topic", ""),
                        package=package,
                        metadata_id=metadata_id,
                        pid=pid,
                        port_alias=options.get("port_alias", {}),
                        port_default=options.get("port_default", {}),
                        hidden_ports=options.get("hidden_ports", []),
                        wait_timeout=options.get("wait_timeout", None),
                        request_timeout=options.get("request_timeout", None),
                        allow_unreachable=options.get("allow_unreachable", None),
                        logger_level=options.get("logger_level", ""),
                        node_type=NodeType(str(ext_node_model.type)),
                        extra=options.get("extra"),
                        input_ports=input_ports,
                        output_ports=output_ports,
                        input_output_ports=input_output_ports,
                    )
                )

        return nodes
