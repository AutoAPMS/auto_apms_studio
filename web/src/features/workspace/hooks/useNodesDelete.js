import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { removeUnusedLayers } from "../utils/layoutUtils.js";
import { getSubtree } from "../utils/subtreeUtils.js";
import { isSubtree } from "../utils/nodeHelpers.js";

/**
 * useNodesDelete
 *
 * Handles node deletion.
 * Removes unused layers and triggers a tree save.
 *
 * @param {Function} setTreeLayers - State setter for tree layers
 * @param {Function} onTreeChange - Callback to trigger tree save
 * @returns {{onNodesDelete: Function, onBeforeDelete: Function}}
 */
export default function useNodesDelete(setTreeLayers, onTreeChange) {
  const { getNodes, getEdges } = useReactFlow();

  const onNodesDelete = useCallback(
    (deletedNodes) => {
      const nodesToRemove = new Set(deletedNodes.map((node) => node.id));

      const remainingNodes = getNodes().filter(
        (node) => !nodesToRemove.has(node.id)
      );
      const remainingEdges = getEdges().filter(
        (e) => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target)
      );

      setTreeLayers((layers) => removeUnusedLayers(remainingNodes, layers));

      if (onTreeChange) {
        onTreeChange(remainingNodes, remainingEdges);
      }
    },
    [getNodes, getEdges, setTreeLayers, onTreeChange]
  );

  const onBeforeDelete = useCallback(
    ({ nodes, edges }) => {
      const updatedNodes = [...nodes];
      const updatedEdges = [...edges];

      nodes.forEach((node) => {
        if (isSubtree(node)) {
          const { nodes: subNodes, edges: subEdges } = getSubtree(
            node,
            getNodes(),
            getEdges()
          );
          updatedNodes.push(...subNodes);
          updatedEdges.push(...subEdges);
        }
      });
      return { nodes: updatedNodes, edges: updatedEdges };
    },
    [getEdges, getNodes]
  );

  return { onNodesDelete, onBeforeDelete };
}
