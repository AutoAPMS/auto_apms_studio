import { renderHook, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import useNodesDelete from "../../../features/workspace/hooks/useNodesDelete";
import { getSubtree } from "../../../features/workspace/utils/subtreeUtils.js";
import { isSubtree } from "../../../features/workspace/utils/nodeHelpers.js";

// --- Mock ReactFlow ---
const mockGetNodes = vi.fn();
const mockGetEdges = vi.fn();

vi.mock("@xyflow/react", () => ({
  useReactFlow: () => ({
    getNodes: mockGetNodes,
    getEdges: mockGetEdges,
  }),
}));

vi.mock("../../../features/workspace/utils/subtreeUtils.js", () => ({
  getSubtree: vi.fn(),
}));

vi.mock(
  "../../../features/workspace/utils/nodeHelpers.js",
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      isSubtree: vi.fn(),
    };
  }
);

// --- Helper to create realistic nodes ---
function createNode(id, layer = 0) {
  return {
    id,
    data: { layer },
  };
}

describe("useNodesDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("removes deleted nodes, updates layers, and triggers onTreeChange", () => {
    const allNodes = [
      createNode("n1", 0),
      createNode("n2", 1),
      createNode("n3", 2),
    ];

    const allEdges = [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3" },
    ];

    mockGetNodes.mockReturnValue(allNodes);
    mockGetEdges.mockReturnValue(allEdges);

    const setTreeLayers = vi.fn((fn) => fn([0, 1, 2]));
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      useNodesDelete(setTreeLayers, onTreeChange)
    );

    act(() => {
      result.current.onNodesDelete([createNode("n2")]);
    });

    // ✅ Remaining nodes should be n1 and n3
    const expectedNodes = [allNodes[0], allNodes[2]];

    // ✅ Remaining edges should remove any touching n2
    const expectedEdges = [];

    expect(onTreeChange).toHaveBeenCalledWith(expectedNodes, expectedEdges);

    // ✅ setTreeLayers called to cleanup layers
    expect(setTreeLayers).toHaveBeenCalled();
  });

  test("does nothing special when deleting nodes not present", () => {
    const nodes = [createNode("a", 0), createNode("b", 1)];

    const edges = [{ id: "e1", source: "a", target: "b" }];

    mockGetNodes.mockReturnValue(nodes);
    mockGetEdges.mockReturnValue(edges);

    const setTreeLayers = vi.fn((fn) => fn([0, 1]));
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      useNodesDelete(setTreeLayers, onTreeChange)
    );

    act(() => {
      result.current.onNodesDelete([createNode("unknown")]);
    });

    // Nothing should change
    expect(onTreeChange).toHaveBeenCalledWith(nodes, edges);
    expect(setTreeLayers).toHaveBeenCalled();
  });

  test("handles multiple deleted nodes", () => {
    const nodes = [createNode("1", 0), createNode("2", 1), createNode("3", 2)];

    const edges = [
      { id: "e1", source: "1", target: "2" },
      { id: "e2", source: "2", target: "3" },
      { id: "e3", source: "1", target: "3" },
    ];

    mockGetNodes.mockReturnValue(nodes);
    mockGetEdges.mockReturnValue(edges);

    const setTreeLayers = vi.fn((fn) => fn([0, 1, 2]));
    const onTreeChange = vi.fn();

    const { result } = renderHook(() =>
      useNodesDelete(setTreeLayers, onTreeChange)
    );

    act(() => {
      result.current.onNodesDelete([createNode("2"), createNode("3")]);
    });

    const expectedNodes = [nodes[0]];
    const expectedEdges = []; // all connected to deleted nodes

    expect(onTreeChange).toHaveBeenCalledWith(expectedNodes, expectedEdges);
  });

  test("deletes entire subtree", () => {
    isSubtree.mockImplementation((n) => n.id === "2");

    const node1 = createNode("1", 0);
    const node2 = createNode("2", 1);
    const node3 = createNode("3", 2);

    const edge1 = { id: "e1", source: "1", target: "2" };
    const subtreeEdge = { id: "e3", source: "2", target: "3" };
    getSubtree.mockReturnValue({ nodes: [node3], edges: [subtreeEdge] });

    const nodesToDelete = [node1, node2];
    const edgesToDelete = [edge1];

    const { result } = renderHook(() => useNodesDelete(null, null));

    const { nodes, edges } = result.current.onBeforeDelete({
      nodes: nodesToDelete,
      edges: edgesToDelete,
    });

    expect(nodes).toStrictEqual([node1, node2, node3]);
    expect(edges).toStrictEqual([edge1, subtreeEdge]);
  });
});
