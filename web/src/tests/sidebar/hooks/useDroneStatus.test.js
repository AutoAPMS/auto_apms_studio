import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDroneStatus } from "../../../features/sidebar/views/DeployView/hooks/useDroneStatus.js";

const { mockCreateWebSocket } = vi.hoisted(() => ({
  mockCreateWebSocket: vi.fn(),
}));

vi.mock(
  "../../../features/sidebar/views/DeployView/services/droneWebSocket.js",
  () => ({
    buildWorkspaceUrl: vi.fn(() => "ws://127.0.0.1:8000/ws/v1/status"),
    WS_PATHS: { STATUS: "/ws/v1/status", MISSION: "/ws/v1/mission" },
    createWebSocket: mockCreateWebSocket,
  })
);

describe("useDroneStatus", () => {
  let mockWs;
  let capturedHandlers;

  beforeEach(() => {
    vi.useFakeTimers();
    mockWs = { close: vi.fn() };
    mockCreateWebSocket.mockImplementation((url, handlers) => {
      capturedHandlers = handlers;
      return mockWs;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should return default state", () => {
    const { result } = renderHook(() => useDroneStatus());
    expect(result.current.connected).toBe(false);
    expect(result.current.ping).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.ip).toBe("127.0.0.1");
    expect(result.current.port).toBe("8000");
  });

  it("should update ip and port", () => {
    const { result } = renderHook(() => useDroneStatus());
    act(() => result.current.setIp("192.168.1.1"));
    act(() => result.current.setPort("9090"));
    expect(result.current.ip).toBe("192.168.1.1");
    expect(result.current.port).toBe("9090");
  });

  it("should set connected and ping on status message", () => {
    const { result } = renderHook(() => useDroneStatus());
    act(() => result.current.connect());
    act(() => capturedHandlers.onOpen());
    act(() =>
      capturedHandlers.onMessage({
        type: "status",
        ping_ms: 42,
        executor_available: true,
      })
    );
    expect(result.current.connected).toBe(true);
    expect(result.current.ping).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it("should not update state on non-status message type", () => {
    const { result } = renderHook(() => useDroneStatus());
    act(() => result.current.connect());
    act(() => capturedHandlers.onMessage({ type: "other" }));
    expect(result.current.connected).toBe(false);
  });

  it("should set disconnected and clear ping on close", () => {
    const { result } = renderHook(() => useDroneStatus());
    act(() => result.current.connect());
    act(() =>
      capturedHandlers.onMessage({
        type: "status",
        ping_ms: 10,
        executor_available: false,
      })
    );
    act(() => capturedHandlers.onClose());
    expect(result.current.connected).toBe(false);
    expect(result.current.ping).toBeNull();
  });

  it("should set error on ws error", () => {
    const { result } = renderHook(() => useDroneStatus());
    act(() => result.current.connect());
    act(() => capturedHandlers.onError());
    expect(result.current.error).toMatch(/failed/i);
    expect(result.current.connected).toBe(false);
  });

  it("should reset state on disconnect", () => {
    const { result } = renderHook(() => useDroneStatus());
    act(() => result.current.connect());
    act(() =>
      capturedHandlers.onMessage({
        type: "status",
        ping_ms: 10,
        executor_available: true,
      })
    );
    act(() => result.current.disconnect());
    expect(result.current.connected).toBe(false);
    expect(result.current.ping).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should set error after ping timeout", () => {
    const { result } = renderHook(() => useDroneStatus());
    act(() => result.current.connect());
    act(() => capturedHandlers.onOpen());
    act(() => vi.advanceTimersByTime(3001));
    expect(result.current.connected).toBe(false);
    expect(result.current.error).toMatch(/3 seconds/);
  });

  it("should close existing ws before reconnecting", () => {
    const { result } = renderHook(() => useDroneStatus());
    act(() => result.current.connect());
    act(() => result.current.connect());
    expect(mockWs.close).toHaveBeenCalled();
  });
});
