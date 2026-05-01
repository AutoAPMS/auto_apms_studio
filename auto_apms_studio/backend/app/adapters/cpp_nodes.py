from auto_apms_studio.backend.app.models.nodes import NodeModel, Port, NodeType
import logging

logger = logging.getLogger(__name__)

try:
    from auto_apms_behavior_tree.resources import get_native_node_model
    from auto_apms_behavior_tree_core.tree.node_model import NodePortDirection

    logger.info("NativeTreeLoader: Successfully imported BehaviorTree.CPP modules.")
except ImportError as e:
    logger.error(
        f"NativeTreeLoader: Failed to import BehaviorTree.CPP modules. Error: {str(e)}"
    )
    get_native_node_model = None
    NodePortDirection = None


class NativeTreeLoader:
    """Imports and converts BehaviorTree.CPP native node models to the internal NodeModel format."""

    @staticmethod
    def get_all_nodes() -> list[NodeModel]:
        """
        Retrieve BehaviorTree.CPP native node models list as a JSON.
        :return: JSON node models list for native nodes
        """
        if not get_native_node_model:
            logger.warning(
                "NativeTreeLoader: get_native_node_model function is not available."
            )
            return []

        native_model = get_native_node_model()
        nodes = []

        for node_name, ext_node_model in native_model.items():
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

            nodes.append(
                NodeModel(
                    node_name=node_name,
                    class_name="",
                    description="",
                    topic="",
                    package="BehaviorTree.CPP",
                    metadata_id="",
                    pid="BehaviorTree.CPP",
                    port_alias={},
                    port_default={},
                    hidden_ports=[],
                    wait_timeout=None,
                    request_timeout=None,
                    allow_unreachable=None,
                    logger_level="",
                    node_type=NodeType(str(ext_node_model.type)),
                    extra=None,
                    input_ports=input_ports,
                    output_ports=output_ports,
                    input_output_ports=input_output_ports,
                )
            )

        return nodes
