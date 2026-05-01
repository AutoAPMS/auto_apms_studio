import asyncio
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..adapters.ros_node import get_node

router = APIRouter()


@router.websocket("/ws")
async def status_websocket(websocket: WebSocket):
    await websocket.accept()
    ros_node = get_node()
    ping_ms = None
    ping_sent_at: float | None = None

    async def send_status():
        while True:
            nodes = [name for name, _ in ros_node.get_node_names_and_namespaces()]
            await websocket.send_json(
                {
                    "type": "status",
                    "drone_connected": True,
                    "executor_available": "tree_executor" in nodes,
                    "ping_ms": ping_ms,
                }
            )
            await asyncio.sleep(0.5)

    async def send_ping():
        nonlocal ping_sent_at
        while True:
            await asyncio.sleep(0.5)
            ping_sent_at = time.time()
            await websocket.send_json({"type": "ping"})

    async def receive_messages():
        nonlocal ping_ms, ping_sent_at
        async for data in websocket.iter_json():
            if data.get("type") == "pong" and ping_sent_at:
                ping_ms = round((time.time() - ping_sent_at) * 1000, 2)
                ping_sent_at = None

    tasks = [
        asyncio.create_task(send_status()),
        asyncio.create_task(send_ping()),
        asyncio.create_task(receive_messages()),
    ]
    try:
        await asyncio.gather(*tasks)
    except (WebSocketDisconnect, Exception):
        pass
    finally:
        for t in tasks:
            t.cancel()
