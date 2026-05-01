import asyncio
import logging
from typing import Optional

import rclpy
from rclpy.executors import SingleThreadedExecutor
from rclpy.node import Node

logger = logging.getLogger(__name__)

_node: Optional[Node] = None
_executor: Optional[SingleThreadedExecutor] = None
_spin_task: Optional[asyncio.Task] = None


async def _spin_ros() -> None:
    """Spin the rclpy executor on the asyncio event loop."""
    assert _executor is not None
    while rclpy.ok():
        try:
            _executor.spin_once(timeout_sec=0.001)
        except Exception:
            if not rclpy.ok():
                break
            logger.exception("Error in rclpy spin loop")
        # Yield to the event loop so other coroutines can run
        await asyncio.sleep(0)


def init_ros_node() -> None:
    """Initialize the ROS 2 node and start the asyncio spin task."""
    global _node, _executor, _spin_task

    if not rclpy.ok():
        rclpy.init()
    if _node is None:
        _node = Node("auto_apms_studio_backend")
        _executor = SingleThreadedExecutor()
        _executor.add_node(_node)
        _spin_task = asyncio.get_running_loop().create_task(_spin_ros())
        logger.info("ROS 2 node initialized with asyncio spin loop")


def shutdown_ros_node() -> None:
    """Cancel the spin task, destroy the node, and finalize rclpy."""
    global _node, _executor, _spin_task

    if _spin_task is not None:
        _spin_task.cancel()
        _spin_task = None
    if _executor is not None:
        _executor.shutdown()
        _executor = None
    if _node is not None:
        _node.destroy_node()
        _node = None
    if rclpy.ok():
        rclpy.shutdown()
    logger.info("ROS 2 node shut down")


def get_node() -> Node:
    """Return the shared ROS 2 node. Raises if not initialized."""
    if _node is None:
        raise RuntimeError(
            "ROS 2 node not initialized. "
            "Ensure the FastAPI lifespan has called init_ros_node()."
        )
    return _node
