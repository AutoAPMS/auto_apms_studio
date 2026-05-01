import { useEffect } from "react";
import { useNodesInitialized, useReactFlow } from "@xyflow/react";
import { useWorkspaceStore } from "../../../store/workspaceStore.js";
import { collisionUtils } from "../utils/collisionUtils.js";
import {
  createLayerAfterLast,
  removeUnusedLayers,
} from "../utils/layoutUtils.js";

export function useNodeInitialization(
  wasTreeLoaded,
  onLayout,
  setTreeLayers,
  elkOptions,
  nodesFullyInitialized
) {
  const nodesInitialized = useNodesInitialized({ includeHiddenNodes: false });
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  useEffect(() => {
    if (nodesInitialized) {
      nodesFullyInitialized.current = true;
      const nodes = getNodes().map((node) => ({
        ...node,
        style: { ...node.style, opacity: 1 },
        hidden:
          node.hidden === true ||
          (node.style?.opacity === 0 && node.data.inSubtree === true),
      }));
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      const edges = getEdges().map((edge) => ({
        ...edge,
        style: { ...edge.style, opacity: 1 },
        hidden:
          nodeMap.get(edge.source)?.hidden || nodeMap.get(edge.target)?.hidden,
      }));

      if (wasTreeLoaded.current) {
        onLayout("DOWN", wasTreeLoaded.current, nodes, edges).then(() => {
          useWorkspaceStore.temporal.getState().clear();
        });
        wasTreeLoaded.current = false;
      } else {
        const resolvedNodes = collisionUtils(nodes, {
          maxIterations: 30,
          overlapThreshold: 0.5,
          margin: 5,
        });

        setTreeLayers((layers) =>
          createLayerAfterLast(
            removeUnusedLayers(resolvedNodes, layers),
            resolvedNodes,
            elkOptions
          )
        );
        setNodes(resolvedNodes);
        setEdges(edges);
      }
    } else {
      nodesFullyInitialized.current = false;
    }
  }, [
    elkOptions,
    getEdges,
    getNodes,
    nodesInitialized,
    onLayout,
    setEdges,
    setNodes,
    setTreeLayers,
    wasTreeLoaded,
    nodesFullyInitialized,
  ]);
}
