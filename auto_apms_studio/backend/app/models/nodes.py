from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel


class NodeType(str, Enum):
    ACTION = "NodeType.ACTION"
    CONDITION = "NodeType.CONDITION"
    CONTROL = "NodeType.CONTROL"
    DECORATOR = "NodeType.DECORATOR"
    SUBTREE = "NodeType.SUBTREE"


class Port(BaseModel):
    name: str
    type: str
    default: str
    has_default: bool
    description: str


class NodeModel(BaseModel):
    node_name: str
    class_name: str
    description: str
    topic: str
    package: str
    metadata_id: str
    pid: str
    port_alias: dict[str, Any]
    port_default: dict[str, Any]
    hidden_ports: list[Port] | list[str] | list[int]
    wait_timeout: Optional[float] = None
    request_timeout: Optional[float] = None
    allow_unreachable: Optional[bool] = None
    logger_level: str
    node_type: NodeType
    extra: Optional[dict[str, Any]] = None
    input_ports: list[Port]
    output_ports: list[Port]
    input_output_ports: list[Port]


class NodeModelList(BaseModel):
    nodes: list[NodeModel]

    model_config = {
        "json_schema_extra": {
            "example": {
                "nodes": [
                    {
                        "node_name": "example name",
                        "class_name": "example_class_name::ThrowException",
                        "description": "example description",
                        "topic": "(input:example)",
                        "package": "example",
                        "metadata_id": "behavior_tree_example_nodes",
                        "pid": "example::behavior_tree_example_nodes",
                        "port_alias": {},
                        "port_default": {},
                        "hidden_ports": [],
                        "wait_timeout": 1,
                        "request_timeout": 1,
                        "allow_unreachable": False,
                        "logger_level": "",
                        "node_type": "NodeType.EXAMPLE",
                        "extra": None,
                        "input_ports": [
                            {
                                "name": "message",
                                "type": "std::string",
                                "has_default": False,
                            }
                        ],
                        "output_ports": [],
                        "input_output_ports": [],
                    }
                ]
            }
        }
    }
