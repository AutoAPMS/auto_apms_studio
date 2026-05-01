import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCopyPaste } from "../../../features/workspace/hooks/useCopyPaste.js";
import { getSubtree } from "../../../features/workspace/utils/subtreeUtils.js";
import {
  isRoot,
  isSubtree,
} from "../../../features/workspace/utils/nodeHelpers.js";

const mocks = vi.hoisted(() => {
  return {
    getNodes: vi.fn(),
    setNodes: vi.fn(),
    getEdges: vi.fn(),
    setEdges: vi.fn(),
    screenToFlowPosition: vi.fn(),
    getNodesBounds: vi.fn(),
    sortNodesByLayer: vi.fn(),
  };
});

vi.mock("@xyflow/react", () => ({
  useReactFlow: vi.fn(() => ({
    getNodes: mocks.getNodes,
    setNodes: mocks.setNodes,
    getEdges: mocks.getEdges,
    setEdges: mocks.setEdges,
    screenToFlowPosition: mocks.screenToFlowPosition,
    getNodesBounds: mocks.getNodesBounds,
  })),
}));

vi.mock("../../../features/workspace/utils/layoutUtils.js", () => ({
  createLayerAfterLast: vi.fn(),
  removeUnusedLayers: vi.fn(),
  sortNodesByLayer: mocks.sortNodesByLayer,
  createLayer: vi.fn().mockImplementation((pos) => pos + 100),
  getNearestLayer: vi.fn().mockReturnValue(0),
}));

vi.mock("../../../features/workspace/utils/subtreeUtils.js", () => ({
  getSubtree: vi.fn(),
}));

vi.mock("../../../features/workspace/utils/collisionUtils.js", () => ({
  collisionUtils: vi.fn().mockImplementation((nodes) => nodes),
}));

vi.mock("../../../features/workspace/utils/nodeHelpers.js", () => ({
  isRoot: vi.fn(),
  isSubtree: vi.fn(),
}));

const copyEvent = new KeyboardEvent("keydown", { key: "c", ctrlKey: true });
const pasteEvent = new KeyboardEvent("keydown", {
  key: "v",
  ctrlKey: true,
});

const createNode = (id, selected, layer, inSubtree = false) => ({
  id: id,
  selected: selected,
  data: { nodeData: {}, inSubtree: inSubtree, layer: layer },
  measured: { width: 0, height: 0 },
  position: { x: 0, y: 0 },
});
const createEdge = (source, target, selected = false) => ({
  id: `e-${source}-${target}`,
  source: source,
  target: target,
  selected: selected,
});

describe("useCopyPaste", () => {
  const treeLayers = [0];
  const elkOptions = {};
  const setTreeLayers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getNodes.mockReturnValue([]);
    mocks.getEdges.mockReturnValue([]);
    mocks.screenToFlowPosition.mockReturnValue({ x: 0, y: 0 });
    mocks.getNodesBounds.mockReturnValue({ x: 0, y: 0, width: 0, height: 0 });
    isRoot.mockReturnValue(false);
    isSubtree.mockReturnValue(false);
    getSubtree.mockReturnValue({ nodes: {}, edges: {} });
    mocks.sortNodesByLayer.mockImplementation((nodes) => [nodes]);
  });

  it("should copy and paste selected nodes and edges", () => {
    const nodes = [
      createNode("1", true, 0),
      createNode("2", true, 0),
      createNode("3", false, 0),
    ];
    mocks.getNodes.mockReturnValue(nodes);
    const edges = [createEdge("1", "2", true)];
    mocks.getEdges.mockReturnValue(edges);

    renderHook(() => useCopyPaste(treeLayers, setTreeLayers, elkOptions));

    document.dispatchEvent(copyEvent);
    document.dispatchEvent(pasteEvent);

    expect(mocks.setNodes).toHaveBeenCalled();
    expect(mocks.setEdges).toHaveBeenCalled();

    const updatedNodes = mocks.setNodes.mock.calls[0][0];
    const updatedEdges = mocks.setEdges.mock.calls[0][0](edges);

    expect(updatedNodes.length).toBe(5);
    expect(updatedNodes.slice(0, 3)).toStrictEqual(nodes);

    const hasUniqueNodeIds = new Set(updatedNodes.map((n) => n.id)).size === 5;
    expect(hasUniqueNodeIds).toBeTruthy();

    expect(updatedEdges.length).toBe(2);
    expect(updatedEdges[0]).toStrictEqual(edges[0]);

    const hasUniqueEdgeIds = new Set(updatedEdges.map((n) => n.id)).size === 2;
    expect(hasUniqueEdgeIds).toBeTruthy();

    expect(updatedEdges[1].source).toBe(updatedNodes[3].id);
    expect(updatedEdges[1].target).toBe(updatedNodes[4].id);
  });

  it("should not copy and paste root or nodes within a subtree", () => {
    isRoot.mockImplementation((node) => node.id === "1");
    const nodes = [
      createNode("1", true, 0),
      createNode("2", true, 0, true),
      createNode("3", true, 0),
    ];
    mocks.getNodes.mockReturnValue(nodes);
    const edges = [createEdge("1", "2", true)];
    mocks.getEdges.mockReturnValue(edges);

    renderHook(() => useCopyPaste(treeLayers, setTreeLayers, elkOptions));

    document.dispatchEvent(copyEvent);
    document.dispatchEvent(pasteEvent);

    expect(mocks.setNodes).toHaveBeenCalled();
    expect(mocks.setEdges).toHaveBeenCalled();

    const updatedNodes = mocks.setNodes.mock.calls[0][0];
    const updatedEdges = mocks.setEdges.mock.calls[0][0](edges);

    expect(updatedNodes.length).toBe(4);
    expect(updatedNodes.slice(0, 3)).toStrictEqual(nodes);

    expect(updatedEdges).toStrictEqual(edges);
  });

  it("should not paste if no nodes copied", () => {
    renderHook(() => useCopyPaste(treeLayers, setTreeLayers, elkOptions));

    document.dispatchEvent(pasteEvent);

    expect(mocks.setNodes).not.toHaveBeenCalled();
    expect(mocks.setEdges).not.toHaveBeenCalled();
  });

  it("should copy nodes and edges of subtrees if subtree node selected", () => {
    isSubtree.mockImplementation((node) => node.id === "1");
    const nodes = [
      createNode("1", true, 0),
      createNode("2", true, 0, true),
      createNode("3", false, 0, true),
    ];
    mocks.getNodes.mockReturnValue(nodes);
    const edges = [createEdge("1", "2"), createEdge("1", "3")];
    mocks.getEdges.mockReturnValue(edges);
    getSubtree.mockReturnValue({ nodes: nodes, edges: edges });

    renderHook(() => useCopyPaste(treeLayers, setTreeLayers, elkOptions));

    document.dispatchEvent(copyEvent);
    document.dispatchEvent(pasteEvent);

    expect(mocks.setNodes).toHaveBeenCalled();
    expect(mocks.setEdges).toHaveBeenCalled();

    const updatedNodes = mocks.setNodes.mock.calls[0][0];
    const updatedEdges = mocks.setEdges.mock.calls[0][0](edges);

    expect(updatedNodes.length).toBe(6);
    expect(updatedNodes.slice(0, 3)).toStrictEqual(nodes);

    expect(updatedEdges.length).toBe(4);
    expect(updatedEdges.slice(0, 2)).toStrictEqual(edges);
  });
});
