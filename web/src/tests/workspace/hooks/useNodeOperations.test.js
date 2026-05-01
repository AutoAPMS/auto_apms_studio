import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import useNodeOperations from "../../../features/workspace/hooks/useNodeOperations.js";
import * as layoutUtils from "../../../features/workspace/utils/layoutUtils.js";
import * as nodeHelpers from "../../../features/workspace/utils/nodeHelpers.js";
import * as collisionUtils from "../../../features/workspace/utils/collisionUtils.js";
import * as dragAndDrop from "../../../context/DragDropContext.jsx";
import * as nodeContext from "../../../context/NodeContext.jsx";
import * as treeToIrConverter from "../../../services/treeToIrConverter.js";
import * as irToFlowConverter from "../../../services/irToFlowConverter.js";

const mockGetNodes = vi.fn();
const mockGetEdges = vi.fn();
const mockScreenToFlowPosition = vi.fn();
const mockGetOutgoers = vi.fn();

vi.mock("@xyflow/react", () => ({
  useReactFlow: vi.fn(() => ({
    getNodes: mockGetNodes,
    getEdges: mockGetEdges,
    screenToFlowPosition: mockScreenToFlowPosition,
  })),
  addEdge: vi.fn((params, edges) => [...edges, params]),
  getOutgoers: (...args) => mockGetOutgoers(...args),
  getIncomers: vi.fn(() => []),
}));

vi.spyOn(layoutUtils, "snapPositionToLayer").mockReturnValue({
  position: { x: 100, y: 0 },
  layer: 0,
});

vi.mock("../../../store/treeStore.js", () => ({
  useStore: {
    getState: vi
      .fn()
      .mockReturnValue({ trees: [{ id: "Test", treeData: "TestData" }] }),
  },
}));

vi.mock("../../../context/DragDropContext.jsx", () => ({
  useDnD: vi.fn().mockReturnValue([{ nodeName: "Action" }, vi.fn()]),
}));

vi.mock("../../../context/NodeContext.jsx", () => ({
  useNodeContext: vi.fn().mockReturnValue([]),
}));

vi.spyOn(nodeHelpers, "isRootOrDecorator").mockReturnValue(false);
vi.spyOn(collisionUtils, "collisionUtils").mockImplementation((nodes) => nodes);
vi.spyOn(treeToIrConverter, "treeToIR").mockReturnValue(null);
vi.spyOn(irToFlowConverter, "IrToFlow");

describe("useNodeOperations", () => {
  const mockSetNodes = vi.fn();
  const mockSetEdges = vi.fn();
  const mockGetId = vi.fn(() => "n1");
  const mockGetNodeDataByName = vi.fn(() => ({ node_name: "Action" }));
  const mockSetTreeLayers = vi.fn();
  const treeLayers = [0, 100];
  const elkOptions = {};
  const mockSetError = vi.fn();
  const mockOnTreeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNodes.mockReturnValue([]);
    mockGetEdges.mockReturnValue([]);
    mockScreenToFlowPosition.mockReturnValue({ x: 100, y: 50 });
    mockGetOutgoers.mockReturnValue([]);
    dragAndDrop.useDnD.mockReturnValue([{ nodeName: "Action" }, vi.fn()]);
    nodeContext.useNodeContext.mockReturnValue({ nodeData: {} });
    irToFlowConverter.IrToFlow.mockReturnValue({ nodes: [], edges: [] });
    nodeHelpers.isRootOrDecorator.mockReturnValue(false);
  });

  it("should handle onConnect", () => {
    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const connection = { source: "1", target: "2" };
    result.current.onConnect(connection);

    expect(mockSetEdges).toHaveBeenCalled();

    const setEdgesCall = mockSetEdges.mock.calls[0][0];

    if (typeof setEdgesCall === "function") {
      const result = setEdgesCall([]);
      expect(result).toEqual([connection]);
    }
  });

  it("should handle onDragOver", () => {
    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const event = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: "" },
    };

    result.current.onDragOver(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.dataTransfer.dropEffect).toBe("move");
  });

  it("should handle onDrop and create new node", () => {
    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const event = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    };

    result.current.onDrop(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockSetNodes).toHaveBeenCalled();
    expect(mockGetId).toHaveBeenCalled();
  });

  it("should not create node on drop if dnd info is empty", () => {
    dragAndDrop.useDnD.mockReturnValue([undefined, vi.fn()]);
    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const event = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    };

    result.current.onDrop(event);

    expect(mockSetNodes).not.toHaveBeenCalled();
  });

  it("should handle onDrop of subtrees if subtreeId is set", () => {
    dragAndDrop.useDnD.mockReturnValue([{ subtreeId: "Test" }, vi.fn()]);
    mockGetNodes.mockReturnValue([{ id: "0" }]);
    irToFlowConverter.IrToFlow.mockReturnValue({
      nodes: [{ id: "root" }, { id: "2" }],
      edges: [{ id: "root-2" }],
    });

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const event = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    };

    result.current.onDrop(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(irToFlowConverter.IrToFlow).toHaveBeenCalled();

    expect(mockSetNodes).toHaveBeenCalled();
    const nodes = mockSetNodes.mock.calls[0][0];

    expect(nodes[0]).toStrictEqual({ id: "0" });
    expect(nodes[1].data.nodeData.subtreeId).toBe("Test");
    expect(nodes[2]).toStrictEqual({ id: "2" });
  });

  it("should handle error thrown onDrop of subtrees ", () => {
    dragAndDrop.useDnD.mockReturnValue([{ subtreeId: "Test" }, vi.fn()]);
    mockGetNodes.mockReturnValue([{ id: "0" }]);
    irToFlowConverter.IrToFlow.mockImplementation(() => {
      throw Error("TestError");
    });

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const event = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    };

    result.current.onDrop(event);

    expect(mockSetError).toHaveBeenCalled();
  });

  it("should validate connection correctly", () => {
    mockGetNodes.mockReturnValue([
      { id: "1", data: {} },
      { id: "2", data: {} },
    ]);
    mockGetEdges.mockReturnValue([]);
    mockGetOutgoers.mockReturnValue([{ id: "3" }]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const isValid = result.current.isValidConnection({
      source: "1",
      target: "2",
    });

    expect(isValid).toBe(true);
  });

  it("should reject self-connection", () => {
    mockGetNodes.mockReturnValue([{ id: "1", data: {} }]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const isValid = result.current.isValidConnection({
      source: "1",
      target: "1",
    });

    expect(isValid).toBe(false);
  });

  it("should return false if cycle is detected (outgoer already visited)", () => {
    const node1 = { id: "1", data: {} };
    const node2 = { id: "2", data: {} };
    const node3 = { id: "3", data: {} };

    mockGetNodes.mockReturnValue([node1, node2, node3]);
    mockGetEdges.mockReturnValue([]);

    mockGetOutgoers
      .mockReturnValueOnce([{ id: "3" }])
      .mockReturnValueOnce([{ id: "1" }]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const isValid = result.current.isValidConnection({
      source: "1",
      target: "2",
    });

    expect(isValid).toBe(false);
  });

  it("should return false if outgoer id is same as source (creates cycle)", () => {
    const node1 = { id: "1", data: {} };
    const node2 = { id: "2", data: {} };

    mockGetNodes.mockReturnValue([node1, node2]);
    mockGetEdges.mockReturnValue([]);

    mockGetOutgoers.mockReturnValueOnce([{ id: "1" }]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const isValid = result.current.isValidConnection({
      source: "1",
      target: "2",
    });

    expect(isValid).toBe(false);
  });

  it("should return true if hasCycle check passes for outgoer", () => {
    const node1 = { id: "1", data: {} };
    const node2 = { id: "2", data: {} };
    const node3 = { id: "3", data: {} };

    mockGetNodes.mockReturnValue([node1, node2, node3]);
    mockGetEdges.mockReturnValue([]);

    mockGetOutgoers.mockReturnValueOnce([{ id: "3" }]).mockReturnValueOnce([]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const isValid = result.current.isValidConnection({
      source: "1",
      target: "2",
    });

    expect(isValid).toBe(true);
  });

  it("should return false if a root or decorator node already has a connection", () => {
    nodeHelpers.isRootOrDecorator.mockReturnValue(true);
    mockGetOutgoers.mockReturnValue([{ id: "3" }]);

    const node1 = { id: "1", data: {} };
    const node2 = { id: "2", data: {} };

    mockGetNodes.mockReturnValue([node1, node2]);
    mockGetEdges.mockReturnValue([]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const isValid = result.current.isValidConnection({
      source: "1",
      target: "2",
    });

    expect(isValid).toBe(false);
  });

  it("should handle onConnectStart with root/decorator node", () => {
    nodeHelpers.isRootOrDecorator.mockReturnValue(true);
    mockGetNodes.mockReturnValue([{ id: "1", type: "rootNode", data: {} }]);
    mockGetEdges.mockReturnValue([{ id: "e1", source: "1", target: "2" }]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    result.current.onConnectStart(null, { nodeId: "1" });

    expect(mockSetEdges).toHaveBeenCalled();
  });

  it("should not remove edge if source is not root/decorator", () => {
    nodeHelpers.isRootOrDecorator.mockReturnValue(false);
    mockGetNodes.mockReturnValue([{ id: "1", type: "custom", data: {} }]);
    mockGetEdges.mockReturnValue([{ id: "e1", source: "1", target: "2" }]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    result.current.onConnectStart(null, { nodeId: "1" });

    expect(mockSetEdges).not.toHaveBeenCalled();
  });

  it("should not remove edge if no edge exists", () => {
    nodeHelpers.isRootOrDecorator.mockReturnValue(true);
    mockGetNodes.mockReturnValue([{ id: "1", type: "rootNode", data: {} }]);
    mockGetEdges.mockReturnValue([]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    result.current.onConnectStart(null, { nodeId: "1" });

    expect(mockSetEdges).not.toHaveBeenCalled();
  });

  it("should call onTreeChange when onConnect is called", () => {
    mockGetNodes.mockReturnValue([{ id: "1" }]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    result.current.onConnect({ source: "1", target: "2" });

    const setEdgesCall = mockSetEdges.mock.calls[0][0];
    setEdgesCall([]);

    expect(mockOnTreeChange).toHaveBeenCalledWith(
      [{ id: "1" }],
      [{ source: "1", target: "2" }]
    );
  });

  it("should call onSelectNode and create node with edge", () => {
    const mockOnTreeChange = vi.fn();
    mockGetNodes.mockReturnValue([]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const parent = { id: "parent-1" };
    result.current.onSelectNode("Action", { x: 100, y: 100 }, parent);

    expect(mockSetNodes).toHaveBeenCalled();
    expect(mockSetEdges).toHaveBeenCalled();
  });

  it("should call onTreeChange in onSelectNode after edge is added", () => {
    const mockOnTreeChange = vi.fn();
    mockGetNodes.mockReturnValue([]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const parent = { id: "parent-1" };
    result.current.onSelectNode("Action", { x: 100, y: 100 }, parent);

    const setEdgesCall = mockSetEdges.mock.calls[0][0];
    setEdgesCall([]);

    expect(mockOnTreeChange).toHaveBeenCalled();
    const [nodes, edges] = mockOnTreeChange.mock.calls[0];
    expect(Array.isArray(nodes)).toBe(true);
    expect(Array.isArray(edges)).toBe(true);
  });

  it("should create subtreeNode type when node_name is SubTree", () => {
    mockGetNodeDataByName.mockReturnValue({ node_name: "SubTree" });
    mockGetNodes.mockReturnValue([]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const parent = { id: "parent-1" };
    result.current.onSelectNode("SubTree", { x: 100, y: 100 }, parent);

    const setNodesCall = mockSetNodes.mock.calls[0][0];
    const newNode = setNodesCall.find((n) => n.id === "n1");
    expect(newNode.type).toBe("subtreeNode");
  });

  it("should create behaviorTreeNode type for non-SubTree nodes in onSelectNode", () => {
    mockGetNodeDataByName.mockReturnValue({ node_name: "Action" });
    mockGetNodes.mockReturnValue([]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const parent = { id: "parent-1" };
    result.current.onSelectNode("Action", { x: 100, y: 100 }, parent);

    const setNodesCall = mockSetNodes.mock.calls[0][0];
    const newNode = setNodesCall.find((n) => n.id === "n1");
    expect(newNode.type).toBe("behaviorTreeNode");
  });

  it("should not call onTreeChange in onSelectNode if not provided", () => {
    mockGetNodes.mockReturnValue([]);

    const { result } = renderHook(() =>
      useNodeOperations(
        mockSetNodes,
        mockSetEdges,
        mockGetId,
        treeLayers,
        elkOptions,
        mockGetNodeDataByName,
        mockSetTreeLayers,
        mockOnTreeChange,
        mockSetError
      )
    );

    const parent = { id: "parent-1" };
    expect(() =>
      result.current.onSelectNode("Action", { x: 100, y: 100 }, parent)
    ).not.toThrow();
  });
});
