import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWorkspaceStore } from "../../../store/workspaceStore.js";

vi.mock("@xyflow/react", () => ({
  applyNodeChanges: vi.fn((changes, nodes) => [...nodes, ...changes]),
  applyEdgeChanges: vi.fn((changes, edges) => [...edges, ...changes]),
}));

import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

beforeEach(() => {
  useWorkspaceStore.setState({
    nodes: [],
    edges: [],
    tmpNodes: [],
    tmpEdges: [],
  });
  useWorkspaceStore.temporal.getState().clear();
});

describe("initial state", () => {
  it("should start with empty nodes and edges", () => {
    const { nodes, edges } = useWorkspaceStore.getState();
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });
});

describe("setNodes", () => {
  it("should set nodes from a plain array", () => {
    const newNodes = [{ id: "1", data: {}, type: "behaviorTreeNode" }];
    useWorkspaceStore.getState().setNodes(newNodes);
    expect(useWorkspaceStore.getState().nodes).toEqual(newNodes);
  });

  it("should set nodes from an updater function", () => {
    const initial = [{ id: "1", data: {}, type: "behaviorTreeNode" }];
    useWorkspaceStore.setState({ nodes: initial });

    useWorkspaceStore
      .getState()
      .setNodes((nodes) => nodes.map((node) => ({ ...node, id: "updated" })));

    expect(useWorkspaceStore.getState().nodes[0].id).toBe("updated");
  });
});

describe("setEdges", () => {
  it("should set edges from a plain array", () => {
    const newEdges = [{ id: "e1", source: "1", target: "2" }];
    useWorkspaceStore.getState().setEdges(newEdges);
    expect(useWorkspaceStore.getState().edges).toEqual(newEdges);
  });

  it("should set edges from an updater function", () => {
    const initial = [{ id: "e1", source: "1", target: "2" }];
    useWorkspaceStore.setState({ edges: initial });

    useWorkspaceStore
      .getState()
      .setEdges((edges) => edges.map((edge) => ({ ...edge, id: "updated" })));

    expect(useWorkspaceStore.getState().edges[0].id).toBe("updated");
  });
});

describe("setTreeLayers", () => {
  it("should set layers from a plain array", () => {
    const newLayers = [100, 200, 300];
    useWorkspaceStore.getState().setTreeLayers(newLayers);
    expect(useWorkspaceStore.getState().treeLayers).toEqual(newLayers);
  });

  it("should set layers from an updater function", () => {
    const initial = [0, 100];
    useWorkspaceStore.setState({ treeLayers: initial });

    useWorkspaceStore
      .getState()
      .setTreeLayers((layers) => layers.map((layer) => layer + 100));

    expect(useWorkspaceStore.getState().treeLayers).toStrictEqual([100, 200]);
  });
});

describe("onNodesChange", () => {
  it("should call applyNodeChanges and update nodes", () => {
    const changes = [{ id: "new", type: "behaviorTreeNode", data: {} }];
    useWorkspaceStore.getState().onNodesChange(changes);

    expect(applyNodeChanges).toHaveBeenCalledWith(changes, []);
    expect(useWorkspaceStore.getState().nodes).toEqual(changes);
  });
});

describe("onEdgesChange", () => {
  it("should call applyEdgeChanges and update edges", () => {
    const changes = [{ id: "e-new", source: "1", target: "2" }];
    useWorkspaceStore.getState().onEdgesChange(changes);

    expect(applyEdgeChanges).toHaveBeenCalledWith(changes, []);
    expect(useWorkspaceStore.getState().edges).toEqual(changes);
  });
});

describe("equality (undo history recording)", () => {
  it("should record a history entry when a node is added", () => {
    useWorkspaceStore.setState({
      tmpNodes: [{ id: "1", type: "behaviorTreeNode", data: { label: "A" } }],
    });

    const { pastStates } = useWorkspaceStore.temporal.getState();
    expect(pastStates.length).toBe(1);
  });

  it("should not record a history entry when only node position changes", () => {
    const node = {
      id: "1",
      type: "behaviorTreeNode",
      parentId: undefined,
      data: { label: "A" },
      position: { x: 0, y: 0 },
    };
    useWorkspaceStore.setState({ tmpNodes: [node] });
    useWorkspaceStore.temporal.getState().clear();

    // Simulate a drag: same node, only position changed
    useWorkspaceStore.setState({
      tmpNodes: [{ ...node, position: { x: 999, y: 999 } }],
    });

    const { pastStates } = useWorkspaceStore.temporal.getState();
    expect(pastStates.length).toBe(0);
  });

  it("should record a history entry when node data changes", () => {
    const node = {
      id: "1",
      type: "behaviorTreeNode",
      parentId: undefined,
      data: { label: "A" },
    };
    useWorkspaceStore.setState({ tmpNodes: [node] });
    useWorkspaceStore.temporal.getState().clear();

    useWorkspaceStore.setState({
      tmpNodes: [{ ...node, data: { label: "B" } }],
    });

    const { pastStates } = useWorkspaceStore.temporal.getState();
    expect(pastStates.length).toBe(1);
  });

  it("should record a history entry when a node is removed", () => {
    useWorkspaceStore.setState({
      tmpNodes: [
        { id: "1", type: "behaviorTreeNode", parentId: undefined, data: {} },
        { id: "2", type: "behaviorTreeNode", parentId: undefined, data: {} },
      ],
    });
    useWorkspaceStore.temporal.getState().clear();

    useWorkspaceStore.setState({
      tmpNodes: [
        { id: "1", type: "behaviorTreeNode", parentId: undefined, data: {} },
      ],
    });

    const { pastStates } = useWorkspaceStore.temporal.getState();
    expect(pastStates.length).toBe(1);
  });

  it("should record a history entry when an edge is added", () => {
    useWorkspaceStore.setState({
      tmpEdges: [{ id: "e1", source: "1", target: "2" }],
    });

    const { pastStates } = useWorkspaceStore.temporal.getState();
    expect(pastStates.length).toBe(1);
  });

  it("should record a history entry when an edge is removed", () => {
    useWorkspaceStore.setState({
      tmpEdges: [
        { id: "e1", source: "1", target: "2" },
        { id: "e2", source: "2", target: "3" },
      ],
    });
    useWorkspaceStore.temporal.getState().clear();

    useWorkspaceStore.setState({
      tmpEdges: [{ id: "e1", source: "1", target: "2" }],
    });

    const { pastStates } = useWorkspaceStore.temporal.getState();
    expect(pastStates.length).toBe(1);
  });

  it("should record a history entry when an edge is changed", () => {
    useWorkspaceStore.setState({
      tmpEdges: [{ id: "e1", source: "1", target: "2" }],
    });
    useWorkspaceStore.temporal.getState().clear();

    useWorkspaceStore.setState({
      tmpEdges: [{ id: "e1", source: "2", target: "3" }],
    });

    const { pastStates } = useWorkspaceStore.temporal.getState();
    expect(pastStates.length).toBe(1);
  });
});

describe("undo / redo", () => {
  it("should undo a node addition", () => {
    useWorkspaceStore.setState({
      tmpNodes: [
        { id: "1", type: "behaviorTreeNode", parentId: undefined, data: {} },
      ],
    });
    useWorkspaceStore.temporal.getState().undo();
    expect(useWorkspaceStore.getState().tmpNodes).toEqual([]);
  });

  it("should redo after an undo", () => {
    const nodes = [
      { id: "1", type: "behaviorTreeNode", parentId: undefined, data: {} },
    ];
    useWorkspaceStore.setState({ tmpNodes: nodes });
    useWorkspaceStore.temporal.getState().undo();
    useWorkspaceStore.temporal.getState().redo();
    expect(useWorkspaceStore.getState().tmpNodes).toEqual(nodes);
  });
});
