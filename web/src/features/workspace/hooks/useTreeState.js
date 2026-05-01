import { useEffect, useRef } from "react";
import { useWorkspaceStore } from "../../../store/workspaceStore.js";
import { useStore } from "../../../store/treeStore.js";

/**
 * Hook to manage the state of the workspace tree (nodes and edges).
 * Synchronizes external initial state into the global `workspaceStore`.
 */
export default function useTreeState(
  initialNodes,
  initialEdges,
  nodesInitialized
) {
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    treeLayers,
    setTreeLayers,
  } = useWorkspaceStore();

  const wasTreeLoaded = useRef(false);
  const prevInitialNodesRef = useRef(null);

  useEffect(() => {
    const currentNodes = useWorkspaceStore.getState().nodes;
    const currentEdges = useWorkspaceStore.getState().edges;
    if (
      (initialNodes === null ||
        (Array.isArray(initialNodes) && initialNodes.length === 0)) &&
      (initialEdges === null ||
        (Array.isArray(initialEdges) && initialEdges.length === 0)) &&
      currentNodes.length === 0 &&
      currentEdges.length === 0 &&
      wasTreeLoaded.current
    ) {
      return;
    }

    if (prevInitialNodesRef.current === initialNodes) return;
    prevInitialNodesRef.current = initialNodes;

    useWorkspaceStore.setState({
      nodes: initialNodes ?? [],
      edges: initialEdges ?? [],
      treeLayers: [500],
    });
    useWorkspaceStore.setState({
      tmpNodes: initialNodes ?? [],
      tmpEdges: initialEdges ?? [],
      tmpTreeLayers: [500],
      tmpSavedJson: useStore.getState().savedJson,
    });
    useWorkspaceStore.temporal.getState().clear();

    wasTreeLoaded.current = true;
  }, [initialNodes, initialEdges]);

  useEffect(() => {
    const measured = nodes.every((n) => n.measured);
    const layers = useWorkspaceStore.getState().treeLayers;

    if (nodesInitialized.current && measured) {
      useWorkspaceStore.setState({
        tmpNodes: nodes,
        tmpEdges: edges,
        tmpTreeLayers: layers,
      });
    }
  }, [edges, nodesInitialized, nodes]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    treeLayers,
    setTreeLayers,
    wasTreeLoaded,
  };
}
