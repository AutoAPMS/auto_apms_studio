import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useSubtreeOperations from "../../../features/workspace/hooks/useSubtreeOperations.js";
import { getSubtree } from "../../../features/workspace/utils/subtreeUtils.js";
import { createTreeAndUpdateStore } from "../../../services/treeService.js";

vi.mock("../../../features/workspace/utils/layoutUtils.js", () => ({
  snapPositionToLayer: vi.fn(() => ({ position: { x: 0, y: 0 }, layer: 0 })),
  createLayerAfterLast: vi.fn((layers) => layers),
  removeUnusedLayers: vi.fn(),
}));

const mocks = vi.hoisted(() => {
  return {
    getNodes: vi.fn(),
    getEdges: vi.fn(),
  };
});

vi.mock("@xyflow/react", () => ({
  useReactFlow: vi.fn(() => ({
    getNodes: mocks.getNodes,
    getEdges: mocks.getEdges,
  })),
}));

vi.mock("../../../services/treeService.js", () => ({
  createTreeAndUpdateStore: vi.fn(),
}));

vi.mock("../../../services/flowToTreeConverter.js", () => ({
  flowToTreeData: vi.fn(),
}));

vi.mock("../../../features/workspace/utils/subtreeUtils.js", () => ({
  getSubtree: vi.fn(),
}));

describe("useSubtreeOperations", () => {
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockSetTreeLayers = vi.fn((fn) => fn([0, 100]));
  const mockGetId = vi.fn(() => "n1");
  const mockGetNodeDataByName = vi.fn(() => ({ node_name: "SubTree" }));
  const mockOnLayout = vi.fn();
  const mockOnTreeChange = vi.fn();

  const nodes = [
    { id: "1", position: { x: 0, y: 0 }, data: { layer: 0, expanded: false } },
    { id: "2", position: { x: 0, y: 100 }, data: { layer: 1 }, hidden: true },
  ];
  const edges = [
    { id: "1-2", source: "1", target: "2" },
    { id: "4-5", source: "4", target: "5" },
  ];
  const elkOptions = {};

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getNodes.mockReturnValue(nodes);
    mocks.getEdges.mockReturnValue(edges);
    getSubtree.mockReturnValue({
      nodes: nodes,
      edges: [{ id: "1-2", source: "1", target: "2" }],
    });
  });

  it("should toggle subtree and trigger layout when expanded", () => {
    mocks.getNodes.mockReturnValue(nodes);
    const { result } = renderHook(() =>
      useSubtreeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        mockSetTreeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockOnLayout,
        mockOnTreeChange
      )
    );

    act(() => {
      result.current.toggleSubtree("1");
    });

    expect(mockOnLayout).toHaveBeenCalled();
    const updatedNodes = mockOnLayout.mock.calls[0][2];
    expect(updatedNodes).toStrictEqual([
      {
        id: "1",
        position: { x: 0, y: 0 },
        data: { layer: 0, expanded: true },
      },
      {
        id: "2",
        position: { x: 0, y: 100 },
        data: { layer: 1, expanded: false },
        hidden: false,
      },
    ]);
  });

  it("should toggle subtree and hide children when not expanded", () => {
    mocks.getNodes.mockReturnValue([
      { id: "1", position: { x: 0, y: 0 }, data: { layer: 0, expanded: true } },
      {
        id: "2",
        position: { x: 0, y: 100 },
        data: { layer: 1 },
        hidden: false,
      },
      {
        id: "3",
        position: { x: 0, y: 100 },
        data: { layer: 1 },
        hidden: false,
      },
    ]);
    const mockSetNodes = vi.fn();
    const { result } = renderHook(() =>
      useSubtreeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        mockSetTreeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockOnLayout,
        mockOnTreeChange
      )
    );

    act(() => {
      result.current.toggleSubtree("1");
    });

    expect(mockSetNodes).toHaveBeenCalledWith([
      {
        id: "1",
        position: { x: 0, y: 0 },
        data: { layer: 0, expanded: false },
      },
      {
        id: "2",
        position: { x: 0, y: 100 },
        data: { layer: 1, expanded: false },
        hidden: true,
      },
      {
        id: "3",
        position: { x: 0, y: 100 },
        data: { layer: 1 },
        hidden: false,
      },
    ]);
  });

  it("should check if node has children", () => {
    const { result } = renderHook(() =>
      useSubtreeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        mockSetTreeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockOnLayout,
        mockOnTreeChange
      )
    );

    const hasChildren = result.current.hasChildren("1");
    expect(hasChildren).toBe(true);

    const hasNoChildren = result.current.hasChildren("2");
    expect(hasNoChildren).toBe(false);
  });

  it("should create subtree with descendants", () => {
    const { result } = renderHook(() =>
      useSubtreeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        mockSetTreeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockOnLayout,
        mockOnTreeChange
      )
    );

    act(() => {
      result.current.createSubtree("1", "TestTree");
    });

    expect(mockSetNodes).toHaveBeenCalled();
    expect(mockSetEdges).toHaveBeenCalled();
    expect(createTreeAndUpdateStore.mock.calls[0][0]).toBe("TestTree");
  });

  it("should return early if node not found in createSubtree", () => {
    const { result } = renderHook(() =>
      useSubtreeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        mockSetTreeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockOnLayout,
        mockOnTreeChange
      )
    );

    act(() => {
      result.current.createSubtree("999", "TestTree");
    });

    expect(mockSetNodes).not.toHaveBeenCalled();
  });
});
