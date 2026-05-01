import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts.js";

const undoMock = vi.fn();
const redoMock = vi.fn();

vi.mock("../../../store/workspaceStore.js", () => {
  return {
    useWorkspaceStore: Object.assign(
      vi.fn(() => ({
        undo: undoMock,
        redo: redoMock,
      })),
      {
        temporal: {
          getState: vi.fn(() => ({
            undo: undoMock,
            redo: redoMock,
            pastStates: [{}],
            futureStates: [{}],
          })),
        },
      },
      {
        getState: vi.fn(() => ({
          tmpNodes: [],
          tmpEdges: [],
          tmpTreeLayers: [],
        })),
        setState: vi.fn(),
      }
    ),
  };
});

describe("useKeyboardShortcuts", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should register a keydown listener on mount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");

    renderHook(() => useKeyboardShortcuts());

    expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("should remove the keydown listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("should call undo when pressing Ctrl+Z", () => {
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "z", ctrlKey: true })
      );
    });

    expect(undoMock).toHaveBeenCalledTimes(1);
  });

  it("should call undo when pressing Cmd+Z (Mac)", () => {
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "z", metaKey: true })
      );
    });

    expect(undoMock).toHaveBeenCalledTimes(1);
  });

  it("should call redo when pressing Ctrl+Y", () => {
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "y", ctrlKey: true })
      );
    });

    expect(redoMock).toHaveBeenCalledTimes(1);
  });

  it("should call redo when pressing Cmd+Y (Mac)", () => {
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "y", metaKey: true })
      );
    });

    expect(redoMock).toHaveBeenCalledTimes(1);
  });

  it("should not call undo or redo when pressing Z without Ctrl/Cmd", () => {
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "z" }));
    });

    expect(undoMock).not.toHaveBeenCalled();
    expect(redoMock).not.toHaveBeenCalled();
  });

  it("should not call undo or redo when pressing an unrelated key with Ctrl", () => {
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "t", ctrlKey: true })
      );
    });

    expect(undoMock).not.toHaveBeenCalled();
    expect(redoMock).not.toHaveBeenCalled();
  });
});
