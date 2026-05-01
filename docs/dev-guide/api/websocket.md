# WebSocket API reference

The backend provides two WebSocket endpoints used for live status and mission execution. These are primarily consumed by the frontend but can be used by other tools.

## Status WebSocket — `/v1/status/ws`

- **Purpose**: periodic status updates (executor availability, ping).
- **Behavior**: upon connection the backend sends JSON messages at periodic intervals.

Example message:

```json
{
  "type": "status",
  "drone_connected": true,
  "executor_available": true,
  "ping_ms": 1.23
}
```

## Mission WebSocket — `/v1/mission/ws/mission`

- **Purpose**: start and monitor a single Behavior Tree mission. One connection represents one mission run.

Frontend → Backend (initial payload):

```json
{
  "build_request": "<BehaviorTree>...</BehaviorTree>",
  "build_handler": "auto_apms_behavior_tree::TreeFromStringBuildHandler",
  "node_manifest": "manifest_identity1,manifest_identity2"
}
```

Backend → Frontend Client Messages

- `type: "status"` — informational messages (e.g., "Request received, connecting to ROS 2 Executor..")

- `type: "feedback"` — streaming feedback from the ROS 2 action server. Example:

```json
{
  "type": "feedback",
  "execution_state": "RUNNING",
  "running_tree": "<identity>",
  "running_action": "ActionName",
  "timestamp": 123456789
}
```

- `type: "result"` — final mission result. Example:

```json
{
  "type": "result",
  "tree_result": "SUCCESS",
  "tree_identity": "<identity>",
  "message": "Finished"
}
```

**Errors**

- The backend sends `type: "error"` messages with `message` describing the problem (e.g., executor unavailable, parsing errors).

**Implementation details**

- The mission WebSocket bridges to the ROS 2 action server `/tree_executor/start` using `rclpy.ActionClient`. The backend waits for server availability, sends the goal and forwards feedback and the final result to the client.
