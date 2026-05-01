import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLayoutedElements } from "../../../features/workspace/services/layoutService.js";

const { layoutSpy } = vi.hoisted(() => {
  return { layoutSpy: vi.fn() };
});

vi.mock("elkjs/lib/elk.bundled.js", () => {
  return {
    default: class ELK {
      layout(graph) {
        return layoutSpy(graph);
      }
    },
  };
});

vi.mock("../../../features/workspace/utils/layoutUtils.js", () => ({
  getNearestLayer: vi.fn(() => 0),
  createLayerAfterLast: vi.fn((layers) => layers),
  createLayer: vi.fn(() => 200),
}));

vi.mock("../../../features/workspace/utils/nodeHelpers.js", () => ({
  isRoot: vi.fn((node) => node.id === "1"),
}));

vi.mock("@xyflow/react", () => ({
  getIncomers: vi.fn(() => []),
}));

describe("getLayoutedElements", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    layoutSpy.mockResolvedValue({
      children: [
        { id: "1", x: 0, y: 0 },
        { id: "2", x: 0, y: 100 },
      ],
      edges: [],
    });
  });

  it("should pass horizontal positions to ELK", async () => {
    const nodes = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        measured: { width: 100, height: 50 },
        data: {},
      },
    ];

    await getLayoutedElements(nodes, [], { "elk.direction": "RIGHT" });

    const graph = layoutSpy.mock.calls[0][0];
    expect(graph.children[0].targetPosition).toBe("left");
    expect(graph.children[0].sourcePosition).toBe("right");
  });

  it("should pass vertical positions to ELK", async () => {
    const nodes = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        measured: { width: 100, height: 50 },
        data: {},
      },
    ];

    await getLayoutedElements(nodes, [], {});

    const graph = layoutSpy.mock.calls[0][0];
    expect(graph.children[0].targetPosition).toBe("top");
    expect(graph.children[0].sourcePosition).toBe("bottom");
  });

  it("should not create a root layer", async () => {
    const nodesToLayout = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        measured: { width: 100, height: 50 },
        data: {},
      },
      {
        id: "2",
        position: { x: 0, y: 50 },
        measured: { width: 100, height: 50 },
        data: {},
      },
    ];

    const { nodes, edges, layers } = await getLayoutedElements(
      nodesToLayout,
      [],
      {}
    );
    expect(nodes.length).toBe(2);
    const node = nodes[1];

    const expectedNode = {
      id: "2",
      position: { x: 0, y: 100 },
      measured: { width: 100, height: 50 },
      data: { layer: 0 },
    };

    expect(node).toStrictEqual(expectedNode);
    expect(edges).toStrictEqual([]);
    expect(layers).toStrictEqual([100]);
  });

  it("should create a layer if the root node is the only node", async () => {
    layoutSpy.mockResolvedValue({
      children: [{ id: "1", x: 0, y: 0 }],
      edges: [],
    });
    const nodesToLayout = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        measured: { width: 100, height: 50 },
        data: {},
      },
    ];

    const { nodes, edges, layers } = await getLayoutedElements(
      nodesToLayout,
      [],
      {}
    );
    expect(nodes.length).toBe(1);
    expect(edges).toStrictEqual([]);
    expect(layers).toStrictEqual([200]);
  });

  it("should handle hidden nodes and their edges", async () => {
    layoutSpy.mockResolvedValue({
      children: [{ id: "1", x: 0, y: 0 }],
      edges: [],
    });
    const nodesToLayout = [
      {
        id: "1",
        position: { x: 0, y: 0 },
        measured: { width: 100, height: 50 },
        data: {},
      },
      {
        id: "2",
        position: { x: 0, y: 0 },
        measured: { width: 100, height: 50 },
        hidden: true,
        data: {},
      },
    ];
    const edgesToLayout = [
      {
        id: "e-1-2",
        source: "1",
        target: "2",
      },
    ];

    const { nodes, edges } = await getLayoutedElements(
      nodesToLayout,
      edgesToLayout,
      {}
    );

    const graph = layoutSpy.mock.calls[0][0];
    expect(graph.children.length).toBe(2);
    expect(graph.children[0].id).toBe("1");
    expect(graph.children[1].id).not.toBe("2");

    expect(graph.edges.length).toBe(0);

    expect(nodes.length).toBe(2);
    expect(nodes[1].id).toBe("2");
    expect(edges).toStrictEqual(edgesToLayout);
  });
});
