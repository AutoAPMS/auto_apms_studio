import os
import logging
from fastapi import Query, WebSocket
from fastapi.websockets import WebSocketState

logger = logging.getLogger(__name__)
API_KEY = os.environ.get("API_KEY", "")


async def verify_token(websocket: WebSocket, token: str = Query("")):
    if API_KEY and token != API_KEY:
        await websocket.accept()
        await websocket.send_json(
            {"type": "error", "message": "Unauthorized: Invalid or missing API key."}
        )
        await websocket.close(code=4001)
        logger.warning(
            "Unauthorized WebSocket connection attempt from %s", websocket.client
        )
        return False
    return True
