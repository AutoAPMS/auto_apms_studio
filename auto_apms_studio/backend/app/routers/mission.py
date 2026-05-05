import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from rclpy.action import ActionClient
from auto_apms_interfaces.action import StartTreeExecutor
from ..adapters.ros_node import get_node
from ..adapters.ros_bridge import await_rclpy_future

router = APIRouter()


@router.websocket("/mission")
async def mission_websocket(websocket: WebSocket):
    """
    WebSocket Backend Endpoint for single mission.

    A single connection represents a single mission.
    When mission is concluded, connection is terminated automatically.
    """
    await websocket.accept()

    ros_node = get_node()
    loop = asyncio.get_running_loop()

    action_client = None
    goal_handle = None

    try:
        raw = await websocket.receive_text()
        payload = json.loads(raw)

        await websocket.send_json(
            {
                "type": "status",
                "message": "Request received, connecting to ROS 2 Executor..",
            }
        )

        executor_action = payload.get("executor", "/tree_executor/start")
        action_client = ActionClient(ros_node, StartTreeExecutor, executor_action)

        available = await loop.run_in_executor(None, action_client.wait_for_server, 5.0)
        if not available:
            await websocket.send_json(
                {
                    "type": "error",
                    "message": "Tree Executor not available. Please ensure it is running.",
                }
            )
            return

        goal = StartTreeExecutor.Goal()
        goal.attach = True
        goal.clear_blackboard = True
        goal.build_request = payload.get("build_request", "")
        goal.build_handler = (
            payload.get("build_handler")
            or "auto_apms_behavior_tree::TreeFromStringBuildHandler"
        )
        goal.entry_point = payload.get("entry_point", "")
        goal.node_manifest = _load_manifests(ros_node, payload.get("node_manifest", ""))

        await websocket.send_json({"type": "status", "message": "Sending goal.."})

        feedback_queue: asyncio.Queue = asyncio.Queue()

        def on_feedback(feedback_msg):
            fb = feedback_msg.feedback
            feedback_queue.put_nowait(
                {
                    "type": "feedback",
                    "execution_state": fb.execution_state_str,
                    "running_tree": fb.running_tree_identity,
                    "running_action": fb.running_action_name,
                    "timestamp": fb.running_action_timestamp,
                }
            )

        goal_handle = await await_rclpy_future(
            action_client.send_goal_async(goal, feedback_callback=on_feedback)
        )
        if not goal_handle.accepted:
            await websocket.send_json(
                {"type": "error", "message": "Goal rejected by Executor"}
            )
            return

        await websocket.send_json({"type": "status", "message": "Mission started!"})

        result_future = goal_handle.get_result_async()

        async def _drain_feedback():
            while True:
                msg = await feedback_queue.get()
                await websocket.send_json(msg)

        feedback_task = asyncio.create_task(_drain_feedback())
        try:
            result_wrapper = await await_rclpy_future(result_future)
        finally:
            feedback_task.cancel()
            try:
                await feedback_task
            except asyncio.CancelledError:
                pass

        # Drain any remaining feedback
        while not feedback_queue.empty():
            await websocket.send_json(feedback_queue.get_nowait())

        r = result_wrapper.result
        result_map = {0: "NOT_SET", 1: "SUCCESS", 2: "FAILURE"}

        await websocket.send_json(
            {
                "type": "result",
                "tree_result": result_map.get(r.tree_result, "UNKNOWN"),
                "tree_identity": r.terminated_tree_identity,
                "message": r.message,
            }
        )
        goal_handle = None  # Mission concluded normally

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        if goal_handle is not None:
            goal_handle.cancel_goal_async()
        if action_client is not None:
            action_client.destroy()


def _load_manifests(ros_node, manifest_string: str) -> str:
    """
    Loads all Node Manifests based on comma separated identities.
    They are merged, single string is returned if no manifests are provided.
    """
    identities = [m.strip() for m in manifest_string.split(",") if m.strip()]
    if not identities:
        return ""

    try:
        from auto_apms_behavior_tree_core.resources import NodeManifestResource

        merged = None
        for identity in identities:
            manifest = NodeManifestResource(identity).node_manifest
            if merged is None:
                merged = manifest
            else:
                for node_name in manifest.get_node_names():
                    if not merged.has_node(node_name):
                        merged.add_node(
                            node_name, manifest.get_node_registration_options(node_name)
                        )

        return merged.dump() if merged else ""
    except Exception as e:
        ros_node.get_logger().warning(
            f"Manifests '{manifest_string}' could not be loaded: {e}"
        )
        return ""
