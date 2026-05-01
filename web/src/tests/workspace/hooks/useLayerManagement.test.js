import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useLayerManagement from "../../../features/workspace/hooks/useLayerManagement.js";
import * as layoutUtils from "../../../features/workspace/utils/layoutUtils.js";
import * as collisionUtils from "../../../features/workspace/utils/collisionUtils.js";

const mockGetNodes = vi.fn();

vi.mock("@xyflow/react", () => ({
  useReactFlow: vi.fn(() => ({
    getNodes: mockGetNodes,
  })),
}));

vi.spyOn(layoutUtils, "snapNodesToLayer");
vi.spyOn(layoutUtils, "removeUnusedLayers").mockReturnValue([0]);
vi.spyOn(layoutUtils, "createLayerAfterLast").mockReturnValue([0, 100]);
vi.spyOn(collisionUtils, "collisionUtils").mockImplementation((nodes) => nodes);

describe("useLayerManagement", () => {
  const mockSetNodes = vi.fn();
  const mockSetTreeLayers = vi.fn((fn) => fn([0]));
  const treeLayers = [0];
  const elkOptions = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle node drag stop and preserve nodes not being dragged", () => {
    // Setup: getNodes gibt 2 Nodes zurück, aber nur node1 wird gedraggt
    const node1 = { id: "1", position: { x: 0, y: 0 }, data: { layer: 0 } };
    const node2 = { id: "2", position: { x: 100, y: 0 }, data: { layer: 0 } };

    mockGetNodes.mockReturnValue([node1, node2]);

    layoutUtils.snapNodesToLayer.mockReturnValue([
      { id: "1", position: { x: 0, y: 50 }, data: { layer: 1 } },
    ]);

    const { result } = renderHook(() =>
      useLayerManagement(
        mockSetNodes,
        mockSetTreeLayers,
        treeLayers,
        elkOptions
      )
    );

    result.current.onNodeDragStop({}, node1, [node1]);

    expect(mockSetNodes).toHaveBeenCalled();

    const updatedNodes = mockSetNodes.mock.calls[0][0];
    expect(updatedNodes).toHaveLength(2);
    expect(updatedNodes.find((n) => n.id === "2")).toBeDefined();
  });
});
