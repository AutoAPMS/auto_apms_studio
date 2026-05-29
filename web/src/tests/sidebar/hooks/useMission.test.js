import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMission } from "../../../features/sidebar/views/DeployView/hooks/useMission.js";

const { mockCreateWebSocket } = vi.hoisted(() => ({
  mockCreateWebSocket: vi.fn(),
}));

vi.mock(
  "../../../features/sidebar/views/DeployView/services/droneWebSocket.js",
  () => ({
    buildWorkspaceUrl: vi.fn(() => "ws://127.0.0.1:8000/ws/v1/mission"),
    WS_PATHS: { STATUS: "/ws/v1/status", MISSION: "/ws/v1/mission" },
    createWebSocket: mockCreateWebSocket,
  })
);

describe("useMission", () => {
  let mockWs;
  let capturedHandlers;

  beforeEach(() => {
    mockWs = { close: vi.fn(), send: vi.fn() };
    mockCreateWebSocket.mockImplementation((url, handlers) => {
      capturedHandlers = handlers;
      return mockWs;
    });
  });

  afterEach(() => vi.clearAllMocks());

  it("should return default state", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    expect(result.current.isRunning).toBe(false);
    expect(result.current.missionStatus).toBeNull();
    expect(result.current.missionError).toBeNull();
  });

  it("should send xml and set isRunning on deploy", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    expect(mockWs.send).toHaveBeenCalledWith("<root/>");
    expect(result.current.isRunning).toBe(true);
  });

  it("should update missionStatus on status message", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    act(() =>
      capturedHandlers.onMessage({ type: "status", message: "Sending goal.." })
    );
    expect(result.current.missionStatus).toBe("Sending goal..");
  });

  it("should update missionStatus on feedback message", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    act(() =>
      capturedHandlers.onMessage({
        type: "feedback",
        execution_state: "RUNNING",
        running_action: "MyAction",
      })
    );
    expect(result.current.missionStatus).toMatch("RUNNING");
  });

  it("should set success status on result SUCCESS", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    act(() =>
      capturedHandlers.onMessage({
        type: "result",
        tree_result: "SUCCESS",
        message: "Done",
      })
    );
    expect(result.current.isRunning).toBe(false);
    expect(result.current.missionStatus).toMatch("succeeded");
  });

  it("should set error on result FAILURE", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    act(() =>
      capturedHandlers.onMessage({
        type: "result",
        tree_result: "FAILURE",
        message: "failed",
      })
    );
    expect(result.current.isRunning).toBe(false);
    expect(result.current.missionError).toMatch("FAILURE");
  });

  it("should set error on error message", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    act(() =>
      capturedHandlers.onMessage({
        type: "error",
        message: "something went wrong",
      })
    );
    expect(result.current.missionError).toMatch("something went wrong");
    expect(result.current.isRunning).toBe(false);
  });

  it("should set error on unexpected close while running", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    act(() => capturedHandlers.onClose());
    expect(result.current.missionError).toMatch(/closed unexpectedly/);
    expect(result.current.isRunning).toBe(false);
  });

  it("should set error on ws connection error", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    act(() => capturedHandlers.onError());
    expect(result.current.missionError).toMatch(/Failed to connect/i);
    expect(result.current.isRunning).toBe(false);
  });

  it("should reset state on cancel", () => {
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());

    // Cancelling: sends the cancel message and enters the cancelling state
    act(() => result.current.cancel());
    expect(mockWs.send).toHaveBeenLastCalledWith(
      JSON.stringify({ type: "cancel" })
    );
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isCancelling).toBe(true);

    // Backend confirms cancellation via a CANCELLED result message
    act(() =>
      capturedHandlers.onMessage({
        type: "result",
        tree_result: "CANCELLED",
        message: "Mission cancelled by user.",
      })
    );
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isCancelling).toBe(false);
    expect(result.current.missionStatus).toBe("Mission cancelled.");
    expect(result.current.missionError).toBeNull();
  });

  it("should log warning on unknown message type", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));
    act(() => result.current.deploy("<root/>"));
    act(() => capturedHandlers.onOpen());
    act(() => capturedHandlers.onMessage({ type: "unknown_type" }));
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("should ignore onOpen from stale websocket after redeploy", () => {
    let firstHandlers;
    let secondHandlers;
    let callCount = 0;

    mockCreateWebSocket.mockImplementation((url, handlers) => {
      callCount++;
      if (callCount === 1) firstHandlers = handlers;
      else secondHandlers = handlers;
      return { close: vi.fn(), send: vi.fn() };
    });

    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));

    act(() => result.current.deploy("<root/>"));
    act(() => result.current.deploy("<root/>"));
    act(() => firstHandlers.onOpen());
    expect(result.current.isRunning).toBe(false);
  });

  it("should ignore onMessage from stale websocket after redeploy", () => {
    let firstHandlers;
    let callCount = 0;

    mockCreateWebSocket.mockImplementation((url, handlers) => {
      callCount++;
      if (callCount === 1) firstHandlers = handlers;
      return { close: vi.fn(), send: vi.fn() };
    });

    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));

    act(() => result.current.deploy("<root/>"));
    act(() => result.current.deploy("<root/>"));

    act(() => firstHandlers.onMessage({ type: "status", message: "stale" }));
    expect(result.current.missionStatus).toBeNull();
  });

  it("should ignore onClose from stale websocket after redeploy", () => {
    let firstHandlers;
    let callCount = 0;

    mockCreateWebSocket.mockImplementation((url, handlers) => {
      callCount++;
      if (callCount === 1) firstHandlers = handlers;
      return { close: vi.fn(), send: vi.fn() };
    });

    const { result } = renderHook(() => useMission("127.0.0.1", "8000"));

    act(() => result.current.deploy("<root/>"));
    act(() => result.current.deploy("<root/>"));

    act(() => firstHandlers.onClose());
    expect(result.current.missionError).toBeNull();
  });
});
