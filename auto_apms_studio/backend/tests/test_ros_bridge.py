import asyncio
from unittest.mock import MagicMock


class TestAwaitRclpyFuture:
    def test_resolves_with_result(self):
        from auto_apms_studio.backend.app.adapters.ros_bridge import await_rclpy_future

        mock_future = MagicMock()
        mock_future.result.return_value = "test_result"
        mock_future.exception.return_value = None

        def _add_cb(cb):
            cb(mock_future)

        mock_future.add_done_callback = _add_cb

        result = asyncio.get_event_loop().run_until_complete(
            await_rclpy_future(mock_future)
        )
        assert result == "test_result"

    def test_resolves_with_exception(self):
        from auto_apms_studio.backend.app.adapters.ros_bridge import await_rclpy_future

        mock_future = MagicMock()
        mock_future.exception.return_value = ValueError("test error")

        def _add_cb(cb):
            cb(mock_future)

        mock_future.add_done_callback = _add_cb

        try:
            asyncio.get_event_loop().run_until_complete(await_rclpy_future(mock_future))
            assert False, "Expected ValueError"
        except ValueError as e:
            assert "test error" in str(e)

    def test_resolves_when_callback_fires_later(self):
        from auto_apms_studio.backend.app.adapters.ros_bridge import await_rclpy_future

        mock_future = MagicMock()
        mock_future.result.return_value = 42
        mock_future.exception.return_value = None

        stored_cb = None

        def _add_cb(cb):
            nonlocal stored_cb
            stored_cb = cb

        mock_future.add_done_callback = _add_cb

        loop = asyncio.new_event_loop()

        async def _run():
            async def _fire_later():
                await asyncio.sleep(0.01)
                stored_cb(mock_future)

            asyncio.create_task(_fire_later())
            return await await_rclpy_future(mock_future)

        result = loop.run_until_complete(_run())
        loop.close()
        assert result == 42
