import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import useTreeChange from "../../../features/workspace/hooks/useTreeChange";

// --- Mocks ---
const mockFlowToTreeData = vi.fn();
const mockUpdateTreeInStore = vi.fn();
const mockUseStore = vi.fn();

// Mock converter
vi.mock("../../../services/flowToTreeConverter.js", () => ({
  flowToTreeData: (...args) => mockFlowToTreeData(...args),
}));

// Mock service
vi.mock("../../../services/treeService.js", () => ({
  updateTreeInStore: (...args) => mockUpdateTreeInStore(...args),
}));

// Mock store
vi.mock("../../../store/treeStore.js", () => ({
  useStore: (selector) => mockUseStore(selector),
}));

describe("useTreeChange", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("updates active tree correctly", () => {
    const trees = [
      { id: "tree1", treeData: {} },
      { id: "tree2", treeData: {} },
    ];

    // selectedTreeId in store
    mockUseStore.mockImplementation((selector) =>
      selector({ selectedTreeId: "tree2" })
    );

    mockFlowToTreeData.mockReturnValue({ converted: true });

    const { result } = renderHook(() => useTreeChange(trees));

    const mockNodes = [{ id: "n1" }];
    const mockEdges = [{ id: "e1" }];

    act(() => {
      result.current(mockNodes, mockEdges);
    });

    expect(mockFlowToTreeData).toHaveBeenCalledWith(mockNodes, mockEdges);

    expect(mockUpdateTreeInStore).toHaveBeenCalledWith("tree2", {
      id: "tree2",
      treeData: { converted: true },
    });
  });

  test("auto-selects single tree if no selectedTreeId", () => {
    const trees = [{ id: "tree1", treeData: {} }];

    mockUseStore.mockImplementation((selector) =>
      selector({ selectedTreeId: null, setSelectedTree: vi.fn() })
    );

    const { result } = renderHook(() => useTreeChange(trees));

    act(() => {
      result.current([], []);
    });

    expect(mockFlowToTreeData).toHaveBeenCalled();
    expect(mockUpdateTreeInStore).toHaveBeenCalled();
  });

  test("does nothing if selected tree not found", () => {
    const trees = [{ id: "tree1", treeData: {} }];

    mockUseStore.mockImplementation((selector) =>
      selector({ selectedTreeId: "missing" })
    );

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() => useTreeChange(trees));

    act(() => {
      result.current([], []);
    });

    expect(mockFlowToTreeData).not.toHaveBeenCalled();
    expect(mockUpdateTreeInStore).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
