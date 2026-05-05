import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildWorkspaceUrl,
  WS_PATHS,
  createWebSocket,
} from "../../../features/sidebar/views/DeployView/services/droneWebSocket.js";

describe("buildWorkspaceUrl", () => {
  it("should build correct WebSocket URL", () => {
    expect(buildWorkspaceUrl("127.0.0.1", "8000", "/ws/v1/status")).toBe(
      "ws://127.0.0.1:8000/ws/v1/status"
    );
  });

  it("should handle custom ip and port", () => {
    expect(
      buildWorkspaceUrl("192.168.1.1", "9090", "/ws/v1/mission")
    ).toBe("ws://192.168.1.1:9090/ws/v1/mission");
  });
});

describe("WS_PATHS", () => {
  it("should have correct STATUS path", () => {
    expect(WS_PATHS.STATUS).toBe("/ws/v1/status");
  });

  it("should have correct MISSION path", () => {
    expect(WS_PATHS.MISSION).toBe("/ws/v1/mission");
  });
});

describe("createWebSocket", () => {
  let mockWs;
  let OriginalWebSocket;

  beforeEach(() => {
    mockWs = { onopen: null, onmessage: null, onclose: null, onerror: null };
    OriginalWebSocket = global.WebSocket;

    function MockWebSocket() {
      return mockWs;
    }
    MockWebSocket.prototype = mockWs;
    global.WebSocket = MockWebSocket;
  });

  afterEach(() => {
    global.WebSocket = OriginalWebSocket;
  });

  it("should create WebSocket with correct URL", () => {
    const ws = createWebSocket("ws://127.0.0.1:8000/test");
    expect(ws).toBe(mockWs);
  });

  it("should call onOpen handler", () => {
    const onOpen = vi.fn();
    createWebSocket("ws://test", { onOpen });
    mockWs.onopen();
    expect(onOpen).toHaveBeenCalled();
  });

  it("should call onMessage with parsed JSON", () => {
    const onMessage = vi.fn();
    createWebSocket("ws://test", { onMessage });
    mockWs.onmessage({ data: JSON.stringify({ type: "status" }) });
    expect(onMessage).toHaveBeenCalledWith({ type: "status" });
  });

  it("should call onError on invalid JSON", () => {
    const onError = vi.fn();
    createWebSocket("ws://test", { onError });
    mockWs.onmessage({ data: "not valid json {{" });
    expect(onError).toHaveBeenCalled();
  });

  it("should call onClose handler", () => {
    const onClose = vi.fn();
    createWebSocket("ws://test", { onClose });
    mockWs.onclose();
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onError handler on ws error", () => {
    const onError = vi.fn();
    createWebSocket("ws://test", { onError });
    mockWs.onerror();
    expect(onError).toHaveBeenCalled();
  });

  it("should work without handlers", () => {
    createWebSocket("ws://test");
    expect(() => {
      mockWs.onopen();
      mockWs.onmessage({ data: JSON.stringify({}) });
      mockWs.onclose();
      mockWs.onerror();
    }).not.toThrow();
  });
});
