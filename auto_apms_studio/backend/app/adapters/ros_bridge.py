import asyncio
from typing import Any


async def await_rclpy_future(rclpy_future) -> Any:
    """Bridge an rclpy Future to an asyncio Future.

    Since the rclpy executor's spin_once runs on the same asyncio event loop,
    the done-callback fires on that loop and can resolve the asyncio Future
    directly without call_soon_threadsafe.
    """
    loop = asyncio.get_running_loop()
    aio_future: asyncio.Future = loop.create_future()

    def _on_done(_):
        if not aio_future.done():
            exc = rclpy_future.exception()
            if exc is not None:
                aio_future.set_exception(exc)
            else:
                aio_future.set_result(rclpy_future.result())

    rclpy_future.add_done_callback(_on_done)
    return await aio_future
