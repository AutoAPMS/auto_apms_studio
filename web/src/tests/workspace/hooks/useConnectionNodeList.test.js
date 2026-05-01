import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { useConnectionNodeList } from "../../../features/workspace/hooks/useConnectionNodeList";

describe("useConnectionNodeList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("initial state is null", () => {
    const { result } = renderHook(() => useConnectionNodeList());
    expect(result.current.nodeList).toBeNull();
  });

  test("onConnectEnd opens node list when connection is invalid", () => {
    const { result } = renderHook(() => useConnectionNodeList());

    const event = { clientX: 100, clientY: 200 };
    const connectionState = {
      isValid: false,
      fromNode: { id: "node-1" },
    };

    act(() => {
      result.current.onConnectEnd(event, connectionState);
      vi.advanceTimersByTime(10);
    });

    expect(result.current.nodeList).toEqual({
      x: 100,
      y: 200,
      parent: { id: "node-1" },
    });
  });

  test("onConnectEnd does nothing when connection is valid", () => {
    const { result } = renderHook(() => useConnectionNodeList());

    const event = { clientX: 100, clientY: 200 };
    const connectionState = { isValid: true, fromNode: { id: "node-1" } };

    act(() => {
      result.current.onConnectEnd(event, connectionState);
      vi.advanceTimersByTime(10);
    });

    expect(result.current.nodeList).toBeNull();
  });

  test("closeNodeList sets nodeList to null", () => {
    const { result } = renderHook(() => useConnectionNodeList());

    act(() => {
      result.current.onConnectEnd(
        { clientX: 50, clientY: 50 },
        { isValid: false, fromNode: { id: "n1" } }
      );
      vi.advanceTimersByTime(10);
    });

    expect(result.current.nodeList).not.toBeNull();

    act(() => {
      result.current.closeNodeList();
    });

    expect(result.current.nodeList).toBeNull();
  });

  test("closes on Escape key", () => {
    const { result } = renderHook(() => useConnectionNodeList());

    act(() => {
      result.current.onConnectEnd(
        { clientX: 50, clientY: 50 },
        { isValid: false, fromNode: { id: "n1" } }
      );
      vi.advanceTimersByTime(10);
    });

    expect(result.current.nodeList).not.toBeNull();

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(result.current.nodeList).toBeNull();
  });

  test("does not close on other keys", () => {
    const { result } = renderHook(() => useConnectionNodeList());

    act(() => {
      result.current.onConnectEnd(
        { clientX: 50, clientY: 50 },
        { isValid: false, fromNode: { id: "n1" } }
      );
      vi.advanceTimersByTime(10);
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(result.current.nodeList).not.toBeNull();
  });

  test("closes on outside mousedown", () => {
    const { result } = renderHook(() => useConnectionNodeList());

    act(() => {
      result.current.onConnectEnd(
        { clientX: 50, clientY: 50 },
        { isValid: false, fromNode: { id: "n1" } }
      );
      vi.advanceTimersByTime(10);
    });

    expect(result.current.nodeList).not.toBeNull();

    const outside = document.createElement("div");
    document.body.appendChild(outside);

    act(() => {
      outside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(result.current.nodeList).toBeNull();

    document.body.removeChild(outside);
  });

  test("does not close on mousedown inside .connection-node-list", () => {
    const { result } = renderHook(() => useConnectionNodeList());

    act(() => {
      result.current.onConnectEnd(
        { clientX: 50, clientY: 50 },
        { isValid: false, fromNode: { id: "n1" } }
      );
      vi.advanceTimersByTime(10);
    });

    const container = document.createElement("div");
    container.className = "connection-node-list";
    const inner = document.createElement("button");
    container.appendChild(inner);
    document.body.appendChild(container);

    act(() => {
      inner.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(result.current.nodeList).not.toBeNull();

    document.body.removeChild(container);
  });
});
