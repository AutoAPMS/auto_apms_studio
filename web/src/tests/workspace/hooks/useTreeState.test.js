import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useTreeState from "../../../features/workspace/hooks/useTreeState.js";
import { useWorkspaceStore } from "../../../store/workspaceStore.js";

describe("useTreeState", () => {
  const nodesInitialized = { current: false };
  beforeEach(() => {
    act(() => {
      useWorkspaceStore.setState({ nodes: [], edges: [], treeLayers: [] });
      useWorkspaceStore.temporal.getState().clear();
    });
    nodesInitialized.current = false;
  });

  it("should initialize with empty nodes and edges", () => {
    const { result } = renderHook(() => useTreeState([], [], nodesInitialized));

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.wasTreeLoaded.current).toBe(true);
  });

  it("should handle undefined initialNodes and initialEdges", () => {
    const { result } = renderHook(() =>
      useTreeState(undefined, undefined, nodesInitialized)
    );

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it("should handle null initialNodes and initialEdges", () => {
    const { result } = renderHook(() =>
      useTreeState(null, null, nodesInitialized)
    );

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it("should update temporal store", () => {
    const initialNodes = [{ measured: {} }];
    renderHook(() => useTreeState(initialNodes, null, nodesInitialized));

    const updatedNodes = [...initialNodes, { measured: {}, id: "test" }];

    act(() => {
      useWorkspaceStore.setState({ nodes: updatedNodes });
      nodesInitialized.current = true;
    });

    const { tmpNodes: nodes } = useWorkspaceStore.getState();
    expect(nodes).toEqual(updatedNodes);
  });
});
