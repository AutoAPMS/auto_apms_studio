import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useTreeLayout from "../../../features/workspace/hooks/useTreeLayout.js";

vi.mock("@xyflow/react", () => ({
  useReactFlow: vi.fn(() => ({
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    fitView: vi.fn(() => Promise.resolve()),
  })),
}));

vi.mock("../../../features/workspace/services/layoutService.js", () => ({
  getLayoutedElements: vi.fn(() =>
    Promise.resolve({
      nodes: [],
      edges: [],
      layers: [0],
    })
  ),
}));

const mocks = vi.hoisted(() => {
  return {
    GetNodesInOrder: vi.fn().mockReturnValue([]),
  };
});

vi.mock("../../../features/workspace/services/treeService.js", () => ({
  getNodesInOrder: mocks.GetNodesInOrder,
}));

describe("useTreeLayout", () => {
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockSetTreeLayers = vi.fn();
  const elkOptions = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call getNodesInOrder when tree was not loaded", async () => {
    const { result } = renderHook(() =>
      useTreeLayout(elkOptions, mockSetNodes, mockSetEdges, mockSetTreeLayers)
    );

    result.current.onLayout("RIGHT", false, [], []);

    expect(mocks.GetNodesInOrder).toHaveBeenCalled();
  });

  it("should use nodes directly when tree was loaded", async () => {
    const { result } = renderHook(() =>
      useTreeLayout(elkOptions, mockSetNodes, mockSetEdges, mockSetTreeLayers)
    );

    result.current.onLayout("RIGHT", true, [], []);

    expect(mockSetTreeLayers).not.toHaveBeenCalled();
  });
});
