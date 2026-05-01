import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useContextMenu } from "../../../hooks/useContextMenu.js";

describe("useContextMenu", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("context menu should be initially hidden", () => {
    const { result } = renderHook(() => useContextMenu());

    expect(result.current.contextMenu.visible).toBe(false);
    expect(result.current.contextMenu.m_pos_x).toBe(0);
    expect(result.current.contextMenu.m_pos_y).toBe(0);
    expect(result.current.contextMenu.items).toEqual([]);
  });

  it("should show context menu with correct position and items", () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      clientX: 100,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    const menuItems = [
      { label: "Action 1", action: vi.fn() },
      { label: "Action 2", action: vi.fn() },
    ];

    act(() => {
      result.current.showContextMenu(mockEvent, menuItems);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(result.current.contextMenu).toEqual({
      visible: true,
      m_pos_x: 100,
      m_pos_y: 150,
      items: menuItems,
    });
  });

  it("should hide context menu again properly", () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      clientX: 100,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    const menuItems = [
      { label: "Action 1", action: vi.fn() },
      { label: "Action 2", action: vi.fn() },
    ];

    act(() => {
      result.current.showContextMenu(mockEvent, menuItems);
    });

    act(() => {
      result.current.hideContextMenu();
    });

    expect(result.current.contextMenu).toEqual({
      visible: false,
      m_pos_x: 0,
      m_pos_y: 0,
      items: [],
    });
  });

  it("should close when pressing 'Escape' key", () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      clientX: 100,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    const menuItems = [
      { label: "Action 1", action: vi.fn() },
      { label: "Action 2", action: vi.fn() },
    ];

    act(() => {
      result.current.showContextMenu(mockEvent, menuItems);
    });

    act(() => {
      const escEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(escEvent);
    });

    expect(result.current.contextMenu).toEqual({
      visible: false,
      m_pos_x: 0,
      m_pos_y: 0,
      items: [],
    });
  });

  it("should not close when pressing a key other than 'Escape', f.e.: T", () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      visible: true,
      clientX: 100,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    const action1 = vi.fn();
    const action2 = vi.fn();

    const menuItems = [
      { label: "Action 1", action: action1 },
      { label: "Action 2", action: action2 },
    ];

    act(() => {
      result.current.showContextMenu(mockEvent, menuItems);
    });

    act(() => {
      const escEvent = new KeyboardEvent("keydown", { key: "T" });
      document.dispatchEvent(escEvent);
    });

    expect(result.current.contextMenu).toEqual({
      visible: true,
      m_pos_x: 100,
      m_pos_y: 150,
      items: [
        { label: "Action 1", action: action1 },
        { label: "Action 2", action: action2 },
      ],
    });
  });

  it("should hide when clicking outside (no .context-menu)", () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      clientX: 100,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    const menuItems = [
      { label: "Action 1", action: vi.fn() },
      { label: "Action 2", action: vi.fn() },
    ];

    act(() => {
      result.current.showContextMenu(mockEvent, menuItems);
    });

    act(() => {
      const clickEvent = new MouseEvent("mousedown");
      Object.defineProperty(clickEvent, "target", { value: document.body });
      document.dispatchEvent(clickEvent);
    });

    expect(result.current.contextMenu).toEqual({
      visible: false,
      m_pos_x: 0,
      m_pos_y: 0,
      items: [],
    });
  });

  it("should not hide when clicking outside (no .context-menu)", () => {
    const { result } = renderHook(() => useContextMenu());

    const mockEvent = {
      clientX: 100,
      clientY: 150,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    act(() => {
      result.current.showContextMenu(mockEvent);
    });

    const contextMenuElement = document.createElement("div");
    contextMenuElement.className = "context-menu";
    document.body.appendChild(contextMenuElement);

    act(() => {
      const clickEvent = new MouseEvent("mousedown");
      Object.defineProperty(clickEvent, "target", {
        value: contextMenuElement,
      });
      document.dispatchEvent(clickEvent);
    });

    expect(result.current.contextMenu).toEqual({
      visible: true,
      m_pos_x: 100,
      m_pos_y: 150,
    });
  });
});
