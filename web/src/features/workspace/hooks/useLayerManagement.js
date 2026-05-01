import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  snapNodesToLayer,
  removeUnusedLayers,
  createLayerAfterLast,
} from "../utils/layoutUtils.js";
import { collisionUtils } from "../utils/collisionUtils.js";

export default function useLayerManagement(
  setNodes,
  setTreeLayers,
  treeLayers,
  elkOptions,
  onTreeChange
) {
  const { getNodes, getEdges } = useReactFlow();

  const getUpdatedNodesOnDrag = useCallback(
    (mouseEvent, nodes) => {
      const nodesToUpdate = new Map(
        snapNodesToLayer(nodes, treeLayers).map((node) => [node.id, node])
      );
      return getNodes().map((node) =>
        !nodesToUpdate.has(node.id) ? node : nodesToUpdate.get(node.id)
      );
    },
    [getNodes, treeLayers]
  );

  const onNodeDragStop = useCallback(
    (mouseEvent, node, nodes) => {
      const updatedNodes = getUpdatedNodesOnDrag(mouseEvent, nodes);

      const resolvedNodes = collisionUtils(updatedNodes, {
        maxIterations: 30,
        overlapThreshold: 0.5,
        margin: 5,
      });

      setNodes(resolvedNodes);
      setTreeLayers((layers) => removeUnusedLayers(resolvedNodes, layers));
      setTreeLayers((layers) =>
        createLayerAfterLast(layers, resolvedNodes, elkOptions)
      );

      if (onTreeChange) {
        onTreeChange(resolvedNodes, getEdges());
      }
    },
    [
      elkOptions,
      getUpdatedNodesOnDrag,
      setNodes,
      setTreeLayers,
      onTreeChange,
      getEdges,
    ]
  );

  return { onNodeDragStop };
}
