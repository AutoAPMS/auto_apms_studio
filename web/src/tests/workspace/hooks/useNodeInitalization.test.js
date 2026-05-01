import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNodeInitialization } from "../../../features/workspace/hooks/useNodeInitialization.js";

const mocks = vi.hoisted(() => ({
  getNodes: vi.fn(),
  setNodes: vi.fn(),
  getEdges: vi.fn(),
  useNodesInitialized: vi.fn(),
}));

vi.mock("@xyflow/react", () => ({
  useReactFlow: vi.fn(() => ({
    getNodes: mocks.getNodes,
    getEdges: mocks.getEdges,
    setNodes: mocks.setNodes,
    setEdges: vi.fn(),
  })),
  useNodesInitialized: mocks.useNodesInitialized,
}));

vi.mock("../../../features/workspace/utils/collisionUtils.js", () => ({
  collisionUtils: vi.fn().mockImplementation((nodes) => nodes),
}));

vi.mock("../../../features/workspace/utils/layoutUtils.js", () => ({
  createLayerAfterLast: vi.fn(),
  removeUnusedLayers: vi.fn(),
}));

describe("useNodeInitialization", () => {
  const elkOptions = {};
  const setTreeLayers = vi.fn();
  const onLayout = vi.fn().mockResolvedValue(null);
  const nodesFullyInitialized = { current: false };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getNodes.mockReturnValue([]);
    mocks.getEdges.mockReturnValue([]);
    nodesFullyInitialized.current = false;
  });

  it("should layout when a new tree was loaded", () => {
    const wasTreeLoaded = { current: true };
    mocks.useNodesInitialized.mockReturnValue(true);

    renderHook(() =>
      useNodeInitialization(
        wasTreeLoaded,
        onLayout,
        setTreeLayers,
        elkOptions,
        nodesFullyInitialized
      )
    );

    expect(onLayout).toHaveBeenCalled();
    expect(wasTreeLoaded.current).toBeFalsy();
  });

  it("should not layout if no tree was loaded", () => {
    const wasTreeLoaded = { current: false };
    mocks.useNodesInitialized.mockReturnValue(true);

    renderHook(() =>
      useNodeInitialization(
        wasTreeLoaded,
        onLayout,
        setTreeLayers,
        elkOptions,
        nodesFullyInitialized
      )
    );

    expect(onLayout).not.toHaveBeenCalled();
    expect(mocks.setNodes).toHaveBeenCalled();
  });

  it("should do nothing if nodes are not initialized", () => {
    const wasTreeLoaded = { current: true };
    mocks.useNodesInitialized.mockReturnValue(false);

    renderHook(() =>
      useNodeInitialization(
        wasTreeLoaded,
        onLayout,
        setTreeLayers,
        elkOptions,
        nodesFullyInitialized
      )
    );

    expect(onLayout).not.toHaveBeenCalled();
    expect(mocks.setNodes).not.toHaveBeenCalled();
    expect(wasTreeLoaded.current).toBeTruthy();
  });

  it("should change opacity of nodes and edges to 1", () => {
    mocks.getNodes.mockReturnValue([{ id: "1" }]);
    mocks.getEdges.mockReturnValue([{ id: "e-1" }]);

    const wasTreeLoaded = { current: false };
    mocks.useNodesInitialized.mockReturnValue(true);

    renderHook(() =>
      useNodeInitialization(
        wasTreeLoaded,
        onLayout,
        setTreeLayers,
        elkOptions,
        nodesFullyInitialized
      )
    );

    expect(mocks.setNodes).toHaveBeenCalled();
    const nodes = mocks.setNodes.mock.calls[0][0];
    expect(nodes[0].style.opacity).toBe(1);
  });
});
