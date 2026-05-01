import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSubtree } from "../../../features/workspace/utils/subtreeUtils.js";
import { isSubtree } from "../../../features/workspace/utils/nodeHelpers.js";

vi.mock("../../../features/workspace/utils/nodeHelpers.js", () => ({
  isSubtree: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  isSubtree.mockReturnValue(false);
});

describe("getSubtree", () => {
  it("should return the nodes and edges of the subtree", () => {
    const root = { id: "1" };
    const nodes = [root, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }];
    const edges = [
      { source: "1", target: "2" },
      { source: "1", target: "3" },
      { source: "2", target: "4" },
      { source: "5", target: "4" },
    ];
    const { nodes: subtreeNodes, edges: subtreeEdges } = getSubtree(
      root,
      nodes,
      edges
    );

    expect(subtreeNodes).toStrictEqual(nodes.slice(0, 4));
    expect(subtreeEdges).toStrictEqual(edges.slice(0, 3));
  });

  it("should not return the descendants of subtree nodes if getEntireTree is false", () => {
    isSubtree.mockImplementation((node) => node.id === "2");
    const root = { id: "1" };
    const nodes = [root, { id: "2" }, { id: "3" }, { id: "4" }];
    const edges = [
      { source: "1", target: "2" },
      { source: "1", target: "3" },
      { source: "2", target: "4" },
    ];
    const { nodes: subtreeNodes, edges: subtreeEdges } = getSubtree(
      root,
      nodes,
      edges,
      false
    );

    expect(subtreeNodes).toStrictEqual(nodes.slice(0, 3));
    expect(subtreeEdges).toStrictEqual(edges.slice(0, 2));
  });
});
